import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import type { CommandeAvecDetails, ClientAvecStats, ParrainAvecStats } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuth = cookieStore.get('admin_auth')?.value === 'authenticated'

  if (!isAuth) {
    return <AdminLogin />
  }

  const supabase = getSupabaseServerClient()

  // Une seule requête : toutes les commandes avec leurs relations
  const { data: commandesRaw } = await supabase
    .from('commandes')
    .select(`
      *,
      clients(*),
      parrains(*),
      paiements(*)
    `)
    .order('created_at', { ascending: false })

  const commandes: CommandeAvecDetails[] = (commandesRaw ?? []).map((c: any) => ({
    ...c,
    total_paye: (c.paiements ?? []).reduce((s: number, p: any) => s + p.montant, 0),
  }))

  // Clients — agrégés depuis les commandes déjà chargées
  const { data: clientsRaw } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  const clientStatsMap = new Map<string, { total_paye: number; nb_commandes: number }>()
  commandes.forEach((c) => {
    const prev = clientStatsMap.get(c.client_id) ?? { total_paye: 0, nb_commandes: 0 }
    clientStatsMap.set(c.client_id, {
      total_paye: prev.total_paye + c.total_paye,
      nb_commandes: prev.nb_commandes + 1,
    })
  })

  const clients: ClientAvecStats[] = (clientsRaw ?? []).map((c: any) => ({
    ...c,
    ...(clientStatsMap.get(c.id) ?? { total_paye: 0, nb_commandes: 0 }),
  }))

  // Parrains avec stats — une seule requête chacun
  const { data: parrainRaw } = await supabase
    .from('parrains')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: toutesCommissions } = await supabase
    .from('commissions')
    .select('parrain_id, montant, statut')

  const commissionsParParrain = new Map<
    string,
    { due: number; payee: number; nb_ventes: number }
  >()
  commandes.forEach((c) => {
    if (c.parrain_id) {
      const prev = commissionsParParrain.get(c.parrain_id) ?? { due: 0, payee: 0, nb_ventes: 0 }
      commissionsParParrain.set(c.parrain_id, { ...prev, nb_ventes: prev.nb_ventes + 1 })
    }
  })
  ;(toutesCommissions ?? []).forEach((com: any) => {
    const prev = commissionsParParrain.get(com.parrain_id) ?? { due: 0, payee: 0, nb_ventes: 0 }
    commissionsParParrain.set(com.parrain_id, {
      ...prev,
      due: com.statut === 'due' ? prev.due + com.montant : prev.due,
      payee: com.statut === 'payee' ? prev.payee + com.montant : prev.payee,
    })
  })

  const parrains: ParrainAvecStats[] = (parrainRaw ?? []).map((p: any) => {
    const stats = commissionsParParrain.get(p.id) ?? { due: 0, payee: 0, nb_ventes: 0 }
    return {
      ...p,
      nb_ventes: stats.nb_ventes,
      commission_due: stats.due,
      commission_payee: stats.payee,
    }
  })

  // Stats globales — calculées depuis les données déjà en mémoire
  const totalEncaisse = commandes.reduce((s, c) => s + c.total_paye, 0)
  const preventesActives = commandes.filter(
    (c) => c.type === 'prevente' && c.statut !== 'complet'
  ).length
  const commissionsDues = (toutesCommissions ?? [])
    .filter((c: any) => c.statut === 'due')
    .reduce((s: number, c: any) => s + c.montant, 0)

  const stats = {
    totalCommandes: commandes.length,
    totalEncaisse,
    preventesActives,
    commissionsDues,
  }

  return (
    <AdminDashboard
      stats={stats}
      commandes={commandes}
      clients={clients}
      parrains={parrains}
    />
  )
}
