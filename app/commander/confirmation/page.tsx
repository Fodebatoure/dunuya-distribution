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
            Envoyez{' '}
            <span className="font-bold text-gray-900">
              {(premierMontant * (commande?.quantite ?? 1)).toLocaleString('fr-CI')} FCFA
            </span>
            {' '}via Wave ou Orange Money
          </p>

          {/* Numéro à envoyer */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-5 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Numéro à utiliser</p>
            <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider mb-3">07 04 36 30 81</p>
            <CopyButton text="0704363081" />
          </div>

          {/* Étapes */}
          <div className="space-y-3 mb-5">
            {[
              { step: '1', text: 'Ouvrez votre application Wave ou Orange Money' },
              { step: '2', text: 'Appuyez sur « Envoyer » ou « Payer »' },
              { step: '3', text: `Entrez le numéro ci-dessus et le montant de ${(premierMontant * (commande?.quantite ?? 1)).toLocaleString('fr-CI')} FCFA` },
              { step: '4', text: `Dans le commentaire, écrivez la référence : ${ref}` },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>

          {/* Opérateurs acceptés */}
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1A73E8]/10 text-[#1A73E8]">Wave</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-100 text-orange-700">Orange Money</span>
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
