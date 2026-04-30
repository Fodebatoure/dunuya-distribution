'use client'

import { useState } from 'react'
import CopyButton from './CopyButton'
import { saveModePaiement } from '@/app/actions'

export default function PaymentMethodSelector({
  commandeId,
  montant,
  reference,
  telephone,
}: {
  commandeId: string | null
  montant: number
  reference: string
  telephone: string | null
}) {
  const [mode, setMode] = useState<'wave' | 'orange' | null>(null)

  const handleSelect = async (choix: 'wave' | 'orange') => {
    setMode(choix)
    if (commandeId) {
      await saveModePaiement(commandeId, choix)
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Choisissez votre mode de paiement :
      </p>

      {/* Sélection */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => handleSelect('wave')}
          className={`rounded-2xl p-4 border-2 text-left transition-all ${
            mode === 'wave'
              ? 'border-[#1A73E8] bg-[#1A73E8]/5'
              : 'border-gray-200 bg-white hover:border-[#1A73E8]/40'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center text-white font-bold text-sm mb-2">
            W
          </div>
          <p className="font-bold text-sm text-gray-900">Wave</p>
          <p className="text-xs text-gray-400 mt-0.5">Lien par WhatsApp</p>
        </button>

        <button
          onClick={() => handleSelect('orange')}
          className={`rounded-2xl p-4 border-2 text-left transition-all ${
            mode === 'orange'
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-orange-300'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm mb-2">
            O
          </div>
          <p className="font-bold text-sm text-gray-900">Orange Money</p>
          <p className="text-xs text-gray-400 mt-0.5">Payer maintenant</p>
        </button>
      </div>

      {/* Résultat Wave */}
      {mode === 'wave' && (
        <div className="bg-[#1A73E8]/5 border border-[#1A73E8]/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-[#1A73E8] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-bold text-[#1A73E8]">Wave sélectionné</p>
          </div>
          <p className="text-sm text-gray-700">
            Vous allez recevoir un lien de paiement Wave de{' '}
            <span className="font-bold">{montant.toLocaleString('fr-CI')} FCFA</span>{' '}
            sur WhatsApp{telephone ? ` au ${telephone}` : ''} dans quelques instants.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Cliquez sur ce lien dès réception pour finaliser votre paiement.
          </p>
        </div>
      )}

      {/* Résultat Orange Money */}
      {mode === 'orange' && (
        <div className="border border-orange-200 bg-orange-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-bold text-orange-700">Orange Money sélectionné</p>
          </div>
          <p className="text-xs text-gray-500 mb-1">Envoyez {montant.toLocaleString('fr-CI')} FCFA à ce numéro :</p>
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-3">
            <p className="text-2xl font-mono font-bold text-gray-900">07 04 36 30 81</p>
            <CopyButton text="0704363081" />
          </div>
          <div className="bg-orange-100 rounded-xl px-3 py-2">
            <p className="text-xs text-orange-800 font-medium">
              Mentionnez la référence <strong>{reference}</strong> dans le commentaire.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
