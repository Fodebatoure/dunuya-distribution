'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase'
import { MONTANT_DIRECT, MONTANT_TRANCHES, MONTANT_RESERVATION_ACOMPTE, MONTANT_RESERVATION_SOLDE, MONTANT_COMMISSION } from '@/lib/types'

// ─── Auth admin ─────────────────────────────────────────────────────────────

export async function adminLogin(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Mot de passe incorrect.' }
  }
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 heures
    path: '/',
  })
  redirect('/admin')
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  redirect('/admin')
}

// ─── Commandes ───────────────────────────────────────────────────────────────

export async function createCommande(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const nom = (formData.get('nom') as string).trim()
  const telephone = (formData.get('telephone') as string).trim()
  const zone = formData.get('zone') as string
  const type = formData.get('type') as 'direct' | 'prevente' | 'reservation'
  const code_parrain = (formData.get('code_parrain') as string | null)?.trim() || null
  const quantite = Math.max(1, Math.min(10, parseInt(formData.get('quantite') as string) || 1))

  if (!nom || !telephone || !zone || !type) {
    return { error: 'Tous les champs obligatoires doivent être remplis.' }
  }

  const supabase = getSupabaseServerClient()

  // 1. Créer ou retrouver le client
  let clientId: string
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('telephone', telephone)
    .single()

  if (existingClient) {
    clientId = existingClient.id
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({ nom, telephone, zone })
      .select('id')
      .single()
    if (clientError || !newClient) {
      return { error: `Erreur Supabase (client) : ${clientError?.message ?? 'réponse vide'}` }
    }
    clientId = newClient.id
  }

  // 2. Générer la référence DD-XXX
  const { count } = await supabase
    .from('commandes')
    .select('*', { count: 'exact', head: true })
  const nextNum = (count ?? 0) + 1
  const reference = `DD-${String(nextNum).padStart(3, '0')}`

  const montantUnitaire =
    type === 'direct' ? MONTANT_DIRECT :
    type === 'reservation' ? MONTANT_RESERVATION_ACOMPTE + MONTANT_RESERVATION_SOLDE :
    MONTANT_TRANCHES.reduce((a, b) => a + b, 0)
  const montantTotal = montantUnitaire * quantite

  // 3. Créer la commande
  const { data: commande, error: commandeError } = await supabase
    .from('commandes')
    .insert({
      reference,
      client_id: clientId,
      parrain_id: null,
      type,
      statut: 'en_attente',
      zone,
      montant_total: montantTotal,
      quantite,
    })
    .select('id')
    .single()

  if (commandeError || !commande) {
    return { error: 'Erreur lors de la création de la commande.' }
  }

  // 4. Vérifier et associer le parrain
  if (code_parrain) {
    const { data: parrain } = await supabase
      .from('parrains')
      .select('id')
      .eq('code', code_parrain.toUpperCase())
      .eq('actif', true)
      .single()

    if (parrain) {
      await supabase
        .from('commandes')
        .update({ parrain_id: parrain.id })
        .eq('id', commande.id)

      await supabase.from('commissions').insert({
        parrain_id: parrain.id,
        commande_id: commande.id,
        montant: MONTANT_COMMISSION,
        statut: 'due',
      })
    }
  }

  redirect(`/commander/confirmation?ref=${reference}`)
}

// ─── Paiements ───────────────────────────────────────────────────────────────

export async function enregistrerPaiement(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const commande_id = formData.get('commande_id') as string
  const mode_paiement = formData.get('mode_paiement') as string
  const reference_momo = (formData.get('reference_momo') as string).trim()

  if (!commande_id || !mode_paiement || !reference_momo) {
    return { error: 'Tous les champs sont requis.', success: false }
  }

  const supabase = getSupabaseServerClient()

  // Récupérer la commande et ses paiements existants
  const { data: commande } = await supabase
    .from('commandes')
    .select('type, statut')
    .eq('id', commande_id)
    .single()

  if (!commande) {
    return { error: 'Commande introuvable.', success: false }
  }

  const { count: nbPaiements } = await supabase
    .from('paiements')
    .select('*', { count: 'exact', head: true })
    .eq('commande_id', commande_id)

  const numeroTranche = (nbPaiements ?? 0) + 1

  let montant: number
  if (commande.type === 'direct') {
    montant = MONTANT_DIRECT
  } else if (commande.type === 'reservation') {
    montant = numeroTranche === 1 ? MONTANT_RESERVATION_ACOMPTE : MONTANT_RESERVATION_SOLDE
  } else {
    montant = MONTANT_TRANCHES[Math.min(numeroTranche - 1, MONTANT_TRANCHES.length - 1)]
  }

  const { error: paiementError } = await supabase.from('paiements').insert({
    commande_id,
    numero_tranche: numeroTranche,
    montant,
    mode_paiement,
    reference_momo,
    date_paiement: new Date().toISOString(),
  })

  if (paiementError) {
    return { error: 'Erreur lors de l\'enregistrement du paiement.', success: false }
  }

  // Mettre à jour le statut
  let nouveauStatut: string
  if (commande.type === 'direct') {
    nouveauStatut = 'complet'
  } else if (commande.type === 'reservation') {
    nouveauStatut = numeroTranche >= 2 ? 'complet' : 'partiel'
  } else {
    nouveauStatut = numeroTranche >= 3 ? 'complet' : 'partiel'
  }

  await supabase
    .from('commandes')
    .update({ statut: nouveauStatut })
    .eq('id', commande_id)

  revalidatePath('/admin')
  return { error: null, success: true }
}

// ─── Parrains ────────────────────────────────────────────────────────────────

export async function createParrain(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const nom = (formData.get('nom') as string).trim()
  const telephone = (formData.get('telephone') as string).trim()

  if (!nom || !telephone) {
    return { error: 'Nom et téléphone requis.', success: false }
  }

  // Générer un code unique : initiales + 4 chiffres aléatoires
  const initiales = nom
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
  const code = `${initiales}${Math.floor(1000 + Math.random() * 9000)}`

  const supabase = getSupabaseServerClient()

  const { error } = await supabase.from('parrains').insert({
    nom,
    telephone,
    code,
    actif: true,
  })

  if (error) {
    return { error: 'Erreur lors de la création du parrain.', success: false }
  }

  revalidatePath('/admin')
  return { error: null, success: true }
}

// ─── Suppression commande ────────────────────────────────────────────────────

export async function supprimerCommande(commandeId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseServerClient()

  // Supprimer dans l'ordre pour respecter les contraintes FK
  await supabase.from('commissions').delete().eq('commande_id', commandeId)
  await supabase.from('paiements').delete().eq('commande_id', commandeId)
  const { error } = await supabase.from('commandes').delete().eq('id', commandeId)

  if (error) {
    return { error: `Erreur suppression : ${error.message}` }
  }

  revalidatePath('/admin')
  return { error: null }
}

// ─── Commissions ─────────────────────────────────────────────────────────────

export async function marquerCommissionPayee(commissionId: string) {
  const supabase = getSupabaseServerClient()
  await supabase
    .from('commissions')
    .update({ statut: 'payee' })
    .eq('id', commissionId)
  revalidatePath('/admin')
}
