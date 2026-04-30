import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase'
import PaymentMethodSelector from './PaymentMethodSelector'

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

  const premierMontant = (commande?.type === 'direct' ? 43000 : 15000) * (commande?.quantite ?? 1)
  const isReservation = commande?.type === 'reservation'
  const isPrevente = commande?.type === 'prevente'
  const prenom = commande?.clients?.nom?.split(' ')[0] || ''
  const telephone = commande?.clients?.telephone || null

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
          {prenom && (
            <p className="text-gray-500 mt-1 text-sm">
              Merci {prenom}, nous avons bien reçu votre commande.
            </p>
          )}
        </div>

        {/* Référence */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Référence commande
          </p>
          <p className="text-3xl font-bold text-[#1D9E75]">{ref}</p>
          <p className="text-xs text-gray-400 mt-1">Conservez cette référence</p>
        </div>

        {/* Calendrier prévente */}
        {isPrevente && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
            <p className="font-semibold text-amber-800 mb-2">Votre calendrier de paiement</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-amber-900">
                <span>1er versement (maintenant)</span>
                <span className="font-bold">15 000 FCFA</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>2e versement</span>
                <span className="font-medium">15 000 FCFA</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>3e versement (avant livraison)</span>
                <span className="font-medium">13 000 FCFA</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendrier réservation */}
        {isReservation && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4">
            <p className="font-semibold text-blue-800 mb-2">Votre calendrier de paiement</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-blue-900">
                <span>Acompte (maintenant)</span>
                <span className="font-bold">15 000 FCFA</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Solde à la livraison</span>
                <span className="font-medium">28 000 FCFA</span>
              </div>
            </div>
          </div>
        )}

        {/* Sélection mode de paiement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <p className="text-sm font-bold text-gray-900 mb-1">
            Montant à payer maintenant :{' '}
            <span className="text-[#1D9E75]">{premierMontant.toLocaleString('fr-CI')} FCFA</span>
          </p>
          <p className="text-xs text-gray-400 mb-5">Choisissez comment vous souhaitez payer</p>

          <PaymentMethodSelector
            commandeId={commande?.id ?? null}
            montant={premierMontant}
            reference={ref}
            telephone={telephone}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          Notre équipe vous contactera pour confirmer la réception du paiement.
        </p>

        <div className="mt-6 text-center">
          <Link href="/commander" className="text-sm text-[#1D9E75] font-medium hover:underline">
            Commander une autre fontaine
          </Link>
        </div>
      </div>
    </main>
  )
}
