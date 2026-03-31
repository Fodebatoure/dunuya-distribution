export interface CommuneData {
  nom: string
  quartiers: string[]
}

export const COMMUNES_ABIDJAN: CommuneData[] = [
  {
    nom: 'Plateau',
    quartiers: ['Centre', 'Zoo', 'Administratif'],
  },
  {
    nom: 'Cocody',
    quartiers: [
      'Centre', 'Riviera 1', 'Riviera 2', 'Riviera 3', 'Riviera 4', 'Riviera 5',
      'Angré', 'Bonoumin', 'II Plateaux', 'Vallon', 'Danga', 'Faya',
      'Lycée Technique', 'Attoban', 'Mermoz', 'Palmeraie', 'Ambassades', 'Blockauss',
    ],
  },
  {
    nom: 'Adjamé',
    quartiers: [
      'Centre', 'Williamsville', 'Anono', 'Km 17', 'Clouetcha', 'Ebimpé', 'Abobo-Doumé',
    ],
  },
  {
    nom: 'Abobo',
    quartiers: [
      'Centre', 'Banco Nord', 'Derrière Rails', 'Agnissankoi', 'Avocatier',
      'Gare', 'PK 18', 'Sagbé', 'Sogefiha', 'Samaké', 'Mairie',
      "N'Dotré", 'Bocabo', 'Habitat', 'Zone Industrielle',
    ],
  },
  {
    nom: 'Yopougon',
    quartiers: [
      'Centre', 'Selmer', 'Wassakara', 'Niangon Nord', 'Niangon Sud',
      'Siporex', 'Kouté', 'Toit Rouge', 'Ficgayo', 'Habitat',
      'Zone Industrielle', 'Attié', 'Maroc', 'Ananeraie', 'Banco', 'Millionnaire',
    ],
  },
  {
    nom: 'Marcory',
    quartiers: ['Centre', 'Zone 4', 'Anoumabo', 'Biétry', 'Résidentiel'],
  },
  {
    nom: 'Koumassi',
    quartiers: ['Centre', 'Commerce', 'Remblai', 'Grand Campement', 'Résidentiel'],
  },
  {
    nom: 'Treichville',
    quartiers: ['Centre', 'Zone 3', 'Arras'],
  },
  {
    nom: 'Port-Bouët',
    quartiers: [
      'Village', 'Vridi 1', 'Vridi 2', 'Vridi 3',
      'Canal', 'Gonzagueville', 'Adjouffou', 'Locodjro', 'Aéroport',
    ],
  },
  {
    nom: 'Attécoubé',
    quartiers: ['Centre', 'Williamsville Sud', 'Abattoir', 'Résidentiel'],
  },
  {
    nom: 'Anyama',
    quartiers: ['Centre', 'Adjamé-Bingerville', 'Ahouabo'],
  },
  {
    nom: 'Bingerville',
    quartiers: ['Centre', 'Akouai-Village', 'Bregbo', "M'badon"],
  },
  {
    nom: 'Songon',
    quartiers: ['Centre', 'Songon Agban', 'Songon Kassemblé'],
  },
]

export const AUTRES_VILLES = ['Bouaké', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Daloa']

// Valeur stockée en base : "Cocody - Angré", "Yopougon - Centre", "Bouaké"
export function zoneLabel(commune: string, quartier: string) {
  return `${commune} - ${quartier}`
}
