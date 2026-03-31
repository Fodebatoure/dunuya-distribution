'use client'

import { useActionState, use } from 'react'
import { createCommande } from '@/app/actions'
import { MONTANT_TRANCHES, MONTANT_DIRECT, MONTANT_RESERVATION_ACOMPTE, MONTANT_RESERVATION_SOLDE } from '@/lib/types'
import { COMMUNES_ABIDJAN, AUTRES_VILLES, zoneLabel } from '@/lib/zones'
import { useState } from 'react'

const initialState = { error: null }

type TypeCommande = 'direct' | 'prevente' | 'reservation'

export default function CommanderPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = use(searchParams)
  const [state, action, pending] = useActionState(createCommande, initialState)
  const [type, setType] = useState<TypeCommande>('prevente')
  const [quantite, setQuantite] = useState(1)

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1D9E75] mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Commander ma fontaine filtrante</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Santé · Économie · Environnement
          </p>
        </div>

        {/* Price cards */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {/* Prévente */}
          <button
            type="button"
            onClick={() => setType('prevente')}
            className={`rounded-xl p-4 border-2 text-left transition-all ${
              type === 'prevente' ? 'border-[#1D9E75] bg-[#1D9E75]/5' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#1D9E75] mb-0.5">
                  Prévente
                </div>
                <div className="font-bold text-gray-900">3 versements</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {MONTANT_TRANCHES.map((m) => m.toLocaleString('fr-CI')).join(' + ')} FCFA
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                type === 'prevente' ? 'border-[#1D9E75] bg-[#1D9E75]' : 'border-gray-300'
              }`} />
            </div>
          </button>

          {/* Réservation */}
          <button
            type="button"
            onClick={() => setType('reservation')}
            className={`rounded-xl p-4 border-2 text-left transition-all ${
              type === 'reservation' ? 'border-[#1D9E75] bg-[#1D9E75]/5' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#1D9E75] mb-0.5">
                  Réservation
                </div>
                <div className="font-bold text-gray-900">Je réserve, je paie à la livraison</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {MONTANT_RESERVATION_ACOMPTE.toLocaleString('fr-CI')} FCFA maintenant
                  {' '}+ {MONTANT_RESERVATION_SOLDE.toLocaleString('fr-CI')} FCFA à la livraison
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                type === 'reservation' ? 'border-[#1D9E75] bg-[#1D9E75]' : 'border-gray-300'
              }`} />
            </div>
          </button>

          {/* Direct */}
          <button
            type="button"
            onClick={() => setType('direct')}
            className={`rounded-xl p-4 border-2 text-left transition-all ${
              type === 'direct' ? 'border-[#1D9E75] bg-[#1D9E75]/5' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#1D9E75] mb-0.5">
                  Achat direct
                </div>
                <div className="font-bold text-gray-900">Paiement complet maintenant</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {MONTANT_DIRECT.toLocaleString('fr-CI')} FCFA
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                type === 'direct' ? 'border-[#1D9E75] bg-[#1D9E75]' : 'border-gray-300'
              }`} />
            </div>
          </button>
        </div>

        {/* Form */}
        <form action={action} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="quantite" value={quantite} />

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              placeholder="Ex: Koffi Ama"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              required
              placeholder="07 XX XX XX XX"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">
              Zone / Ville <span className="text-red-500">*</span>
            </label>
            <select
              id="zone"
              name="zone"
              required
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent bg-white"
            >
              <option value="" disabled>Choisir votre commune et quartier</option>
              {COMMUNES_ABIDJAN.map((commune) => (
                <optgroup key={commune.nom} label={`Abidjan — ${commune.nom}`}>
                  {commune.quartiers.map((q) => {
                    const val = zoneLabel(commune.nom, q)
                    return <option key={val} value={val}>{q}</option>
                  })}
                </optgroup>
              ))}
              <optgroup label="Autres villes">
                {AUTRES_VILLES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="code_parrain" className="block text-sm font-medium text-gray-700 mb-1">
              Code parrain <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              id="code_parrain"
              name="code_parrain"
              type="text"
              placeholder="Ex: KAM1234"
              defaultValue={params.ref || ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent uppercase"
            />
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de fontaines
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-600 text-lg font-bold hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors flex items-center justify-center"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-900 w-6 text-center">{quantite}</span>
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.min(10, q + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-600 text-lg font-bold hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors flex items-center justify-center"
              >
                +
              </button>
              {quantite > 1 && (
                <span className="text-sm text-[#1D9E75] font-medium ml-1">
                  = {(quantite * (type === 'direct' ? MONTANT_DIRECT : type === 'reservation' ? MONTANT_RESERVATION_ACOMPTE : MONTANT_TRANCHES[0])).toLocaleString('fr-CI')} FCFA à verser maintenant
                </span>
              )}
            </div>
          </div>

          {state.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[#1D9E75] py-3.5 text-sm font-semibold text-white hover:bg-[#17856A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Envoi en cours...' : `Confirmer ${quantite > 1 ? `mes ${quantite} fontaines` : 'ma commande'}`}
          </button>
        </form>

        {/* Info contextuelle selon le type */}
        {type === 'prevente' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Comment fonctionne la prévente ?</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>1er versement : 15 000 FCFA (confirmation)</li>
              <li>2e versement : 15 000 FCFA</li>
              <li>3e versement : 13 000 FCFA (livraison)</li>
            </ol>
          </div>
        )}

        {type === 'reservation' && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Comment fonctionne la réservation ?</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Acompte maintenant : 15 000 FCFA (réservation confirmée)</li>
              <li>Solde à la livraison : 28 000 FCFA</li>
            </ol>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Dunuya Distribution · Abidjan, Côte d&apos;Ivoire
        </p>
      </div>
    </main>
  )
}
