import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase'
import CopyButton from './CopyButton'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref } = await searchParams

  if (!ref) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">Référence de commande manquante.</p>
          <Link href="/commander" className="mt-4 inline-block text-[#1D9E75] font-medium">
            Retour au formulaire
          </Link>
        </div>
      </main>
    )
  }

  const supabase = getSupabaseServerClient()
  const { data: commande } = await supabase
    .from('commandes')
    .select('*, clients(*)')
    .eq('reference', ref)
    .single()

  const premierMontant = commande?.type === 'direct' ? 43000 : 15000
  const isReservation = commande?.type === 'reservation'
  const isPrevente = commande?.type === 'prevente'

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Succès */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1D9E75] mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Commande confirmée !</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Merci {commande?.clients?.nom?.split(' ')[0] || ''}, nous avons bien reçu votre commande.
          </p>
        </div>

        {/* Référence */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Référence commande
          </p>
          <p className="text-3xl font-bold text-[#1D9E75]">{ref}</p>
          <p className="text-xs text-gray-400 mt-1">Conservez cette référence</p>
        </div>

        {/* Instructions paiement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-1">Effectuez votre paiement</h2>
          <p className="text-sm text-gray-500 mb-5">
            Montant à payer :{' '}
            <span className="font-bold text-gray-900">
              {(premierMontant * (commande?.quantite ?? 1)).toLocaleString('fr-CI')} FCFA
            </span>
          </p>

          {/* Bouton Wave — lien direct avec montant pré-rempli */}
          <a
            href={`https://pay.wave.com/m/M_ci_CCtNzviEb1yB/c/ci/?amount=${premierMontant * (commande?.quantite ?? 1)}`}
            className="flex items-center justify-between w-full bg-[#1A73E8] text-white rounded-2xl px-5 py-4 mb-3 active:opacity-80"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">W</div>
              <div className="text-left">
                <p className="font-bold text-sm">Payer avec Wave</p>
                <p className="text-xs text-white/75">
                  {(premierMontant * (commande?.quantite ?? 1)).toLocaleString('fr-CI')} FCFA · montant pré-rempli
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Orange Money — numéro + copier */}
          <div className="border border-gray-100 rounded-2xl px-5 py-4 mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">Orange Money</span>
              <CopyButton text="0704363081" />
            </div>
            <p className="text-2xl font-mono font-bold text-gray-900 mt-2">07 04 36 30 81</p>
            <p className="text-xs text-gray-400 mt-1">Envoyer {(premierMontant * (commande?.quantite ?? 1)).toLocaleString('fr-CI')} FCFA à ce numéro</p>
          </div>

          <div className="bg-[#1D9E75]/5 rounded-xl p-3">
            <p className="text-xs text-[#1D9E75] font-medium">
              Mentionnez la référence <strong>{ref}</strong> dans le commentaire de votre paiement.
            </p>
          </div>
        </div>

        {isPrevente && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-4">
            <p className="font-semibold mb-1">Calendrier prévente</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>1er versement (maintenant)</span>
                <span className="font-medium">15 000 FCFA</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>2e versement</span>
                <span className="font-medium">15 000 FCFA</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>3e versement (avant livraison)</span>
                <span className="font-medium">13 000 FCFA</span>
              </div>
            </div>
          </div>
        )}

        {isReservation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-4">
            <p className="font-semibold mb-1">Votre réservation</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Acompte maintenant</span>
                <span className="font-medium">15 000 FCFA</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Solde à la livraison</span>
                <span className="font-medium">28 000 FCFA</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-2">
          Notre équipe vous contactera pour confirmer la réception du paiement.
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/commander"
            className="text-sm text-[#1D9E75] font-medium hover:underline"
          >
            Commander une autre fontaine
          </Link>
        </div>
      </div>
    </main>
  )
}
