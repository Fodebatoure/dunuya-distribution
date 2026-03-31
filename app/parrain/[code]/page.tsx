import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase'

const LABELS_STATUT: Record<string, { label: string; class: string }> = {
  en_attente: { label: 'En attente', class: 'bg-gray-100 text-gray-600' },
  partiel: { label: 'Partiel', class: 'bg-amber-100 text-amber-700' },
  complet: { label: 'Complet', class: 'bg-green-100 text-green-700' },
  annule: { label: 'Annulé', class: 'bg-red-100 text-red-700' },
}

function formatMontant(n: number) {
  return n.toLocaleString('fr-CI') + ' FCFA'
}

export default async function ParrainPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = getSupabaseServerClient()

  const { data: parrain } = await supabase
    .from('parrains')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (!parrain) {
    notFound()
  }

  // Commandes générées par ce parrain
  const { data: commandesRaw } = await supabase
    .from('commandes')
    .select(`
      id, reference, statut, type, montant_total, zone, created_at,
      clients(nom, zone),
      paiements(montant)
    `)
    .eq('parrain_id', parrain.id)
    .order('created_at', { ascending: false })

  const commandes = (commandesRaw ?? []).map((c: any) => ({
    ...c,
    total_paye: (c.paiements ?? []).reduce((s: number, p: any) => s + p.montant, 0),
  }))

  // Commissions
  const { data: commissionsRaw } = await supabase
    .from('commissions')
    .select('montant, statut')
    .eq('parrain_id', parrain.id)

  const commissionDue = (commissionsRaw ?? [])
    .filter((c: any) => c.statut === 'due')
    .reduce((s: number, c: any) => s + c.montant, 0)

  const commissionPayee = (commissionsRaw ?? [])
    .filter((c: any) => c.statut === 'payee')
    .reduce((s: number, c: any) => s + c.montant, 0)

  const lienPartage = `https://dunuya.com/commander?ref=${parrain.code}`

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* Profil parrain */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] font-bold text-lg">
              {parrain.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{parrain.nom}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-bold text-[#1D9E75] bg-[#1D9E75]/10 px-2 py-0.5 rounded">
                  {parrain.code}
                </span>
                {parrain.actif ? (
                  <span className="text-xs text-green-600 font-medium">Actif</span>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Inactif</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{commandes.length}</p>
              <p className="text-xs text-gray-500">Ventes</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-amber-700">{formatMontant(commissionDue)}</p>
              <p className="text-xs text-amber-600">À recevoir</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-green-700">{formatMontant(commissionPayee)}</p>
              <p className="text-xs text-green-600">Reçu</p>
            </div>
          </div>
        </div>

        {/* Lien de partage */}
        <div className="bg-[#1D9E75]/5 border border-[#1D9E75]/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1D9E75] uppercase tracking-wide mb-2">
            Votre lien de parrainage
          </p>
          <p className="text-sm font-mono text-gray-700 break-all mb-3">{lienPartage}</p>
          <Link
            href={`/commander?ref=${parrain.code}`}
            className="inline-block text-sm bg-[#1D9E75] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#17856A] transition-colors"
          >
            Partager ce lien
          </Link>
        </div>

        {/* Liste commandes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-sm text-gray-900">
              Ventes générées ({commandes.length})
            </h2>
          </div>

          {commandes.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              Aucune vente pour l&apos;instant.<br />
              <span className="text-xs">Partagez votre lien pour commencer.</span>
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {commandes.map((c: any) => {
                const statut = LABELS_STATUT[c.statut]
                return (
                  <div key={c.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-[#1D9E75] font-medium">
                            {c.reference}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statut.class}`}>
                            {statut.label}
                          </span>
                        </div>
                        {/* Nom masqué : initiale + *** */}
                        <p className="text-sm text-gray-700">
                          {c.clients?.nom?.charAt(0)}*** · {c.zone}
                        </p>
                        <p className="text-xs text-gray-400">
                          {c.type === 'prevente' ? 'Prévente' : 'Direct'} ·{' '}
                          Payé : {formatMontant(c.total_paye)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1D9E75]">
                          +{formatMontant(3000)}
                        </p>
                        <p className="text-xs text-gray-400">commission</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Dunuya Distribution · Abidjan, Côte d&apos;Ivoire
        </p>
      </div>
    </main>
  )
}
