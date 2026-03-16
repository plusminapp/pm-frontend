import type { Bucket } from '../types'

export interface Rule {
  patroon: string                // case-insensitive substring match on tegenpartij
  omschrijvingPatroon?: string   // optional match on omschrijving
  richting?: 'credit' | 'debit' // undefined = match both directions
  bucket: Bucket
  subCategorie: string
  naam: string
}

export const defaultRules: Rule[] = [
  // INKOMEN
  { patroon: 'werkgever',     bucket: 'INKOMEN',      subCategorie: 'salaris',      naam: 'werkgever' },
  { patroon: 'salaris',       bucket: 'INKOMEN',      subCategorie: 'salaris',      naam: 'salaris' },
  { patroon: 'uwv',           bucket: 'INKOMEN',      subCategorie: 'uitkering',    naam: 'UWV' },
  { patroon: 'sociale dienst',bucket: 'INKOMEN',      subCategorie: 'uitkering',    naam: 'sociale dienst' },
  { patroon: 'belastingdienst', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'toeslagen',   naam: 'Belastingdienst toeslag' },
  { patroon: 'belastingdienst', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'belasting',   naam: 'Belastingdienst aanslag' },
  { patroon: 'svb', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'aow',         naam: 'SVB uitkering' },
  { patroon: 'svb', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'verzekering', naam: 'SVB premie' },

  // LEEFGELD
  { patroon: 'albert heijn',  bucket: 'LEEFGELD',     subCategorie: 'boodschappen', naam: 'Albert Heijn' },
  { patroon: 'jumbo',         bucket: 'LEEFGELD',     subCategorie: 'boodschappen', naam: 'Jumbo' },
  { patroon: 'lidl',          bucket: 'LEEFGELD',     subCategorie: 'boodschappen', naam: 'Lidl' },
  { patroon: 'aldi',          bucket: 'LEEFGELD',     subCategorie: 'boodschappen', naam: 'Aldi' },
  { patroon: 'plus supermarkt',bucket: 'LEEFGELD',    subCategorie: 'boodschappen', naam: 'Plus Supermarkt' },
  { patroon: 'dirk',          bucket: 'LEEFGELD',     subCategorie: 'boodschappen', naam: 'Dirk' },
  { patroon: 'spar',          bucket: 'LEEFGELD',     subCategorie: 'boodschappen', naam: 'Spar' },
  { patroon: 'kruidvat',      bucket: 'LEEFGELD',     subCategorie: 'drogist',      naam: 'Kruidvat' },
  { patroon: 'etos',          bucket: 'LEEFGELD',     subCategorie: 'drogist',      naam: 'Etos' },
  { patroon: 'da drogist',    bucket: 'LEEFGELD',     subCategorie: 'drogist',      naam: 'DA Drogist' },
  { patroon: 'hema',          bucket: 'LEEFGELD',     subCategorie: 'kleding',      naam: 'HEMA' },
  { patroon: 'action',        bucket: 'LEEFGELD',     subCategorie: 'huishouden',   naam: 'Action' },
  { patroon: 'blokker',       bucket: 'LEEFGELD',     subCategorie: 'huishouden',   naam: 'Blokker' },
  { patroon: 'ikea',          bucket: 'LEEFGELD',     subCategorie: 'huishouden',   naam: 'IKEA' },
  { patroon: 'primark',       bucket: 'LEEFGELD',     subCategorie: 'kleding',      naam: 'Primark' },
  { patroon: 'h&m',           bucket: 'LEEFGELD',     subCategorie: 'kleding',      naam: 'H&M' },
  { patroon: 'zara',          bucket: 'LEEFGELD',     subCategorie: 'kleding',      naam: 'Zara' },
  { patroon: 'mediamarkt',    bucket: 'LEEFGELD',     subCategorie: 'elektronica',  naam: 'MediaMarkt' },
  { patroon: 'bol.com',       bucket: 'LEEFGELD',     subCategorie: 'online',       naam: 'Bol.com' },
  { patroon: 'coolblue',      bucket: 'LEEFGELD',     subCategorie: 'elektronica',  naam: 'Coolblue' },
  { patroon: 'mcdonalds',     bucket: 'LEEFGELD',     subCategorie: 'horeca',       naam: "McDonald's" },
  { patroon: 'mcdonald',      bucket: 'LEEFGELD',     subCategorie: 'horeca',       naam: "McDonald's" },
  { patroon: 'starbucks',     bucket: 'LEEFGELD',     subCategorie: 'horeca',       naam: 'Starbucks' },
  { patroon: 'ns ',           bucket: 'LEEFGELD',     subCategorie: 'vervoer',      naam: 'NS' },
  { patroon: 'ns reizigers',  bucket: 'LEEFGELD',     subCategorie: 'vervoer',      naam: 'NS Reizigers' },
  { patroon: 'ov-chipkaart',  bucket: 'LEEFGELD',     subCategorie: 'vervoer',      naam: 'OV-chipkaart' },
  { patroon: 'gvb',           bucket: 'LEEFGELD',     subCategorie: 'vervoer',      naam: 'GVB' },
  { patroon: 'ret ',          bucket: 'LEEFGELD',     subCategorie: 'vervoer',      naam: 'RET' },
  { patroon: 'connexxion',    bucket: 'LEEFGELD',     subCategorie: 'vervoer',      naam: 'Connexxion' },
  { patroon: 'arriva',        bucket: 'LEEFGELD',     subCategorie: 'vervoer',      naam: 'Arriva' },
  { patroon: 'shell',         bucket: 'LEEFGELD',     subCategorie: 'brandstof',    naam: 'Shell' },
  { patroon: 'bp tankstation', bucket: 'LEEFGELD',     subCategorie: 'brandstof',    naam: 'BP' },
  { patroon: 'tango',         bucket: 'LEEFGELD',     subCategorie: 'brandstof',    naam: 'Tango' },

  // VASTE_LASTEN
  { patroon: 'ziggo',         bucket: 'VASTE_LASTEN', subCategorie: 'internet',     naam: 'Ziggo' },
  { patroon: 'kpn',           bucket: 'VASTE_LASTEN', subCategorie: 'telecom',      naam: 'KPN' },
  { patroon: 'vodafone',      bucket: 'VASTE_LASTEN', subCategorie: 'telecom',      naam: 'Vodafone' },
  { patroon: 't-mobile',      bucket: 'VASTE_LASTEN', subCategorie: 'telecom',      naam: 'T-Mobile' },
  { patroon: 'odido',         bucket: 'VASTE_LASTEN', subCategorie: 'telecom',      naam: 'Odido' },
  { patroon: 'vattenfall',    bucket: 'VASTE_LASTEN', subCategorie: 'energie',      naam: 'Vattenfall' },
  { patroon: 'eneco',         bucket: 'VASTE_LASTEN', subCategorie: 'energie',      naam: 'Eneco' },
  { patroon: 'nuon',          bucket: 'VASTE_LASTEN', subCategorie: 'energie',      naam: 'Nuon' },
  { patroon: 'essent',        bucket: 'VASTE_LASTEN', subCategorie: 'energie',      naam: 'Essent' },
  { patroon: 'greenchoice',   bucket: 'VASTE_LASTEN', subCategorie: 'energie',      naam: 'Greenchoice' },
  { patroon: 'waterschap',    bucket: 'VASTE_LASTEN', subCategorie: 'water',        naam: 'Waterschap' },
  { patroon: 'waternet',      bucket: 'VASTE_LASTEN', subCategorie: 'water',        naam: 'Waternet' },
  { patroon: 'woonbedrijf',   bucket: 'VASTE_LASTEN', subCategorie: 'huur',         naam: 'Woonbedrijf' },
  { patroon: 'ymere',         bucket: 'VASTE_LASTEN', subCategorie: 'huur',         naam: 'Ymere' },
  { patroon: 'vestia',        bucket: 'VASTE_LASTEN', subCategorie: 'huur',         naam: 'Vestia' },
  { patroon: 'zorgverzekering',bucket:'VASTE_LASTEN', subCategorie: 'zorg',         naam: 'Zorgverzekering' },
  { patroon: 'cz ',           bucket: 'VASTE_LASTEN', subCategorie: 'zorg',         naam: 'CZ' },
  { patroon: 'vgz',           bucket: 'VASTE_LASTEN', subCategorie: 'zorg',         naam: 'VGZ' },
  { patroon: 'zilveren kruis',bucket: 'VASTE_LASTEN', subCategorie: 'zorg',         naam: 'Zilveren Kruis' },
  { patroon: 'menzis',        bucket: 'VASTE_LASTEN', subCategorie: 'zorg',         naam: 'Menzis' },
  { patroon: 'nationale nederlanden', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'uitkering',   naam: 'Nationale Nederlanden uitkering' },
  { patroon: 'nationale nederlanden', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'verzekering', naam: 'Nationale Nederlanden premie' },
  { patroon: 'aegon',         bucket: 'VASTE_LASTEN', subCategorie: 'verzekering',  naam: 'Aegon' },
  { patroon: 'interpolis',    bucket: 'VASTE_LASTEN', subCategorie: 'verzekering',  naam: 'Interpolis' },
  { patroon: 'gemeente', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'toeslag',      naam: 'Gemeente toeslag' },
  { patroon: 'gemeente', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'gemeentelijk', naam: 'Gemeente belasting' },

  // SPAREN
  { patroon: 'spaarrekening', bucket: 'SPAREN',       subCategorie: 'sparen',       naam: 'Spaarrekening' },
  { patroon: 'spaardepot',    bucket: 'SPAREN',       subCategorie: 'sparen',       naam: 'Spaardepot' },
]
