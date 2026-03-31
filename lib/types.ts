// Zone = "Commune - Quartier" pour Abidjan (ex: "Cocody - Angré") ou ville pour les autres
export type Zone = string

export type TypeCommande = 'direct' | 'prevente' | 'reservation'
export type StatutCommande = 'en_attente' | 'partiel' | 'complet' | 'annule'
export type ModePaiement = 'orange' | 'mtn' | 'wave' | 'moov'
export type StatutCommission = 'due' | 'payee'

export const MODES_PAIEMENT: { value: ModePaiement; label: string }[] = [
  { value: 'orange', label: 'Orange Money' },
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'moov', label: 'Moov Money' },
]

export const MONTANT_DIRECT = 43000
export const MONTANT_TRANCHES = [15000, 15000, 13000]
export const MONTANT_RESERVATION_ACOMPTE = 15000
export const MONTANT_RESERVATION_SOLDE = 28000
export const MONTANT_COMMISSION = 3000

export interface Client {
  id: string
  nom: string
  telephone: string
  zone: Zone
  created_at: string
}

export interface Parrain {
  id: string
  nom: string
  telephone: string
  code: string
  actif: boolean
  created_at: string
}

export interface Commande {
  id: string
  reference: string
  client_id: string
  parrain_id: string | null
  type: TypeCommande
  statut: StatutCommande
  zone: Zone
  montant_total: number
  quantite: number
  created_at: string
  clients?: Client
  parrains?: Parrain
  paiements?: Paiement[]
}

export interface Paiement {
  id: string
  commande_id: string
  numero_tranche: number
  montant: number
  mode_paiement: ModePaiement
  reference_momo: string
  date_paiement: string
}

export interface Commission {
  id: string
  parrain_id: string
  commande_id: string
  montant: number
  statut: StatutCommission
  created_at: string
}

export interface CommandeAvecDetails extends Commande {
  clients: Client
  parrains?: Parrain
  paiements: Paiement[]
  total_paye: number
}

export interface ClientAvecStats extends Client {
  total_paye: number
  nb_commandes: number
}

export interface ParrainAvecStats extends Parrain {
  nb_ventes: number
  commission_due: number
  commission_payee: number
}
