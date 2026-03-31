'use client'

import { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { enregistrerPaiement, createParrain, adminLogout, supprimerCommande } from '@/app/actions'
import type { CommandeAvecDetails, ClientAvecStats, ParrainAvecStats } from '@/lib/types'
import { MODES_PAIEMENT, MONTANT_TRANCHES, MONTANT_DIRECT } from '@/lib/types'
import { COMMUNES_ABIDJAN, AUTRES_VILLES } from '@/lib/zones'

// ─── Types props ─────────────────────────────────────────────────────────────

interface Stats {
  totalCommandes: number
  totalEncaisse: number
  preventesActives: number
  commissionsDues: number
}

interface Props {
  stats: Stats
  commandes: CommandeAvecDetails[]
  clients: ClientAvecStats[]
  parrains: ParrainAvecStats[]
}

// ─── Utils ───────────────────────────────────────────────────────────────────

const LABELS_STATUT: Record<string, { label: string; class: string }> = {
  en_attente: { label: 'En attente', class: 'bg-gray-100 text-gray-700' },
  partiel: { label: 'Partiel', class: 'bg-amber-100 text-amber-700' },
  complet: { label: 'Complet', class: 'bg-green-100 text-green-700' },
  annule: { label: 'Annulé', class: 'bg-red-100 text-red-700' },
}

function whatsappLink(telephone: string, message: string) {
  const num = telephone.replace(/\D/g, '')
  const full = num.startsWith('225') ? num : `225${num}`
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`
}

function formatMontant(n: number) {
  return n.toLocaleString('fr-CI') + ' FCFA'
}

// ─── Modal paiement ──────────────────────────────────────────────────────────

function ModalPaiement({
  commande,
  onClose,
}: {
  commande: CommandeAvecDetails
  onClose: () => void
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(enregistrerPaiement, { error: null, success: false })

  const nbExistants = commande.paiements?.length ?? 0
  const numeroTranche = nbExistants + 1
  const montant =
    commande.type === 'direct'
      ? MONTANT_DIRECT
      : MONTANT_TRANCHES[Math.min(nbExistants, MONTANT_TRANCHES.length - 1)]

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onClose()
    }
  }, [state.success, router, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Enregistrer un paiement</h3>
        <p className="text-sm text-gray-500 mb-4">
          {commande.reference} · {commande.clients.nom}
        </p>

        <form action={action} className="space-y-4">
          <input type="hidden" name="commande_id" value={commande.id} />

          <div className="bg-[#1D9E75]/5 rounded-lg p-3 text-sm">
            <span className="text-gray-500">Tranche {numeroTranche} — Montant :</span>
            <span className="font-bold text-[#1D9E75] ml-1">{formatMontant(montant)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de paiement
            </label>
            <select
              name="mode_paiement"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
            >
              <option value="">Choisir...</option>
              {MODES_PAIEMENT.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Référence Mobile Money
            </label>
            <input
              name="reference_momo"
              type="text"
              required
              placeholder="Ex: TXN123456"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-[#1D9E75] py-2.5 text-sm font-semibold text-white hover:bg-[#17856A] disabled:opacity-60"
            >
              {pending ? 'Enregistrement...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal parrain ───────────────────────────────────────────────────────────

function ModalParrain({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createParrain, { error: null, success: false })

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onClose()
    }
  }, [state.success, router, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Nouveau parrain</h3>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              name="nom"
              type="text"
              required
              placeholder="Ex: Kouamé Jean"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              name="telephone"
              type="tel"
              required
              placeholder="07 XX XX XX XX"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-[#1D9E75] py-2.5 text-sm font-semibold text-white hover:bg-[#17856A] disabled:opacity-60"
            >
              {pending ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Dashboard principal ─────────────────────────────────────────────────────

export default function AdminDashboard({ stats, commandes, clients, parrains }: Props) {
  const [activeTab, setActiveTab] = useState<'commandes' | 'clients' | 'parrains'>('commandes')
  const [searchCommandes, setSearchCommandes] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [searchClients, setSearchClients] = useState('')
  const [filtreZone, setFiltreZone] = useState('')
  const [paiementCommande, setPaiementCommande] = useState<CommandeAvecDetails | null>(null)
  const [showModalParrain, setShowModalParrain] = useState(false)
  const router = useRouter()

  // Filtres commandes
  const commandesFiltrees = commandes.filter((c) => {
    const matchSearch =
      !searchCommandes ||
      c.clients.nom.toLowerCase().includes(searchCommandes.toLowerCase()) ||
      c.clients.telephone.includes(searchCommandes) ||
      c.reference.toLowerCase().includes(searchCommandes.toLowerCase())
    const matchStatut = !filtreStatut || c.statut === filtreStatut
    return matchSearch && matchStatut
  })

  // Filtres clients
  const clientsFiltres = clients.filter((c) => {
    const matchSearch =
      !searchClients ||
      c.nom.toLowerCase().includes(searchClients.toLowerCase()) ||
      c.telephone.includes(searchClients)
    const matchZone = !filtreZone || c.zone === filtreZone || c.zone.startsWith(filtreZone + ' -')
    return matchSearch && matchZone
  })

  const tabs = [
    { key: 'commandes', label: `Commandes (${commandes.length})` },
    { key: 'clients', label: `Clients (${clients.length})` },
    { key: 'parrains', label: `Parrains (${parrains.length})` },
  ] as const

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1D9E75] flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">Admin Dunuya</span>
          </div>
          <form action={adminLogout}>
            <button type="submit" className="text-xs text-gray-500 hover:text-gray-700">
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Commandes', value: stats.totalCommandes, suffix: '' },
            { label: 'Encaissé', value: formatMontant(stats.totalEncaisse), suffix: '' },
            { label: 'Préventes actives', value: stats.preventesActives, suffix: '' },
            { label: 'Commissions dues', value: formatMontant(stats.commissionsDues), suffix: '' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Tab Commandes ─── */}
          {activeTab === 'commandes' && (
            <div>
              <div className="p-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Rechercher nom, tél, référence..."
                  value={searchCommandes}
                  onChange={(e) => setSearchCommandes(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
                <select
                  value={filtreStatut}
                  onChange={(e) => setFiltreStatut(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="partiel">Partiel</option>
                  <option value="complet">Complet</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>

              <div className="divide-y divide-gray-50">
                {commandesFiltrees.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">Aucune commande trouvée</p>
                )}
                {commandesFiltrees.map((c) => {
                  const statut = LABELS_STATUT[c.statut]
                  const nbPaiements = c.paiements?.length ?? 0
                  const peutPayer = c.statut !== 'complet' && c.statut !== 'annule'
                  const msgWA =
                    c.statut === 'en_attente'
                      ? `Bonjour ${c.clients.nom}, votre commande Dunuya (${c.reference}) est en attente de votre premier paiement de ${c.type === 'direct' ? '43 000' : '15 000'} FCFA. Merci !`
                      : c.statut === 'partiel'
                      ? `Bonjour ${c.clients.nom}, rappel : il vous reste ${3 - nbPaiements} versement(s) pour votre fontaine Dunuya (${c.reference}).`
                      : `Bonjour ${c.clients.nom}, votre paiement est complet ! Votre fontaine Dunuya (${c.reference}) sera livrée prochainement.`

                  return (
                    <div key={c.id} className="px-4 py-3 hover:bg-gray-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono font-medium text-[#1D9E75]">
                              {c.reference}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statut.class}`}>
                              {statut.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {c.type === 'prevente' ? 'Prévente' : 'Direct'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{c.clients.nom}</p>
                          <p className="text-xs text-gray-500">
                            {c.clients.telephone} · {c.zone}
                            {c.quantite > 1 && (
                              <span className="ml-1 font-semibold text-gray-700">· {c.quantite} fontaines</span>
                            )}
                            {c.parrains && (
                              <span className="ml-1 text-[#1D9E75]">· Parrain: {c.parrains.code}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Payé : {formatMontant(c.total_paye)} / {formatMontant(c.montant_total)}
                            {c.type === 'prevente' && ` (${nbPaiements}/3 tranches)`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {peutPayer && (
                            <button
                              onClick={() => setPaiementCommande(c)}
                              className="text-xs bg-[#1D9E75] text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-[#17856A] transition-colors"
                            >
                              + Paiement
                            </button>
                          )}
                          <a
                            href={whatsappLink(c.clients.telephone, msgWA)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-green-500 text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-green-600 transition-colors"
                          >
                            WA
                          </a>
                          <button
                            onClick={async () => {
                              if (!confirm(`Supprimer la commande ${c.reference} ? Cette action est irréversible.`)) return
                              const result = await supprimerCommande(c.id)
                              if (result.error) alert(result.error)
                              else router.refresh()
                            }}
                            className="text-xs bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg font-medium hover:bg-red-200 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── Tab Clients ─── */}
          {activeTab === 'clients' && (
            <div>
              <div className="p-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Rechercher nom, téléphone..."
                  value={searchClients}
                  onChange={(e) => setSearchClients(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
                <select
                  value={filtreZone}
                  onChange={(e) => setFiltreZone(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
                >
                  <option value="">Toutes les zones</option>
                  <optgroup label="Abidjan">
                    {COMMUNES_ABIDJAN.map((c) => (
                      <option key={c.nom} value={c.nom}>{c.nom}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Autres villes">
                    {AUTRES_VILLES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="divide-y divide-gray-50">
                {clientsFiltres.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">Aucun client trouvé</p>
                )}
                {clientsFiltres.map((c) => (
                  <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.nom}</p>
                      <p className="text-xs text-gray-500">
                        {c.telephone} · {c.zone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.nb_commandes} commande{c.nb_commandes > 1 ? 's' : ''} · Payé : {formatMontant(c.total_paye)}
                      </p>
                    </div>
                    <a
                      href={whatsappLink(c.telephone, `Bonjour ${c.nom}, nous sommes Dunuya Distribution. Comment pouvons-nous vous aider ?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-500 text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      WA
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Tab Parrains ─── */}
          {activeTab === 'parrains' && (
            <div>
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => setShowModalParrain(true)}
                  className="text-sm bg-[#1D9E75] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#17856A] transition-colors"
                >
                  + Nouveau parrain
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {parrains.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">Aucun parrain</p>
                )}
                {parrains.map((p) => (
                  <div key={p.id} className="px-4 py-3 hover:bg-gray-50/50">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gray-900">{p.nom}</span>
                          <span className="text-xs font-mono font-bold text-[#1D9E75] bg-[#1D9E75]/10 px-1.5 py-0.5 rounded">
                            {p.code}
                          </span>
                          {!p.actif && (
                            <span className="text-xs text-red-500">Inactif</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{p.telephone}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {p.nb_ventes} vente{p.nb_ventes > 1 ? 's' : ''} ·{' '}
                          <span className="text-amber-600">Due: {formatMontant(p.commission_due)}</span>
                          {p.commission_payee > 0 && (
                            <span className="text-green-600"> · Payée: {formatMontant(p.commission_payee)}</span>
                          )}
                        </p>
                        <p className="text-xs text-[#1D9E75] mt-0.5">
                          Lien : dunuya.com/commander?ref={p.code}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={whatsappLink(
                            p.telephone,
                            `Bonjour ${p.nom}, voici votre lien de parrainage Dunuya : https://dunuya.com/commander?ref=${p.code}\n\nCode : ${p.code}\nCommissions : ${formatMontant(p.commission_due)} en attente.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-500 text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                          WA
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {paiementCommande && (
        <ModalPaiement
          commande={paiementCommande}
          onClose={() => setPaiementCommande(null)}
        />
      )}
      {showModalParrain && (
        <ModalParrain onClose={() => setShowModalParrain(false)} />
      )}
    </main>
  )
}
