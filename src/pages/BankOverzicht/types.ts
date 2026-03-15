export type BankFormat = 'ING' | 'ABN_AMRO' | 'RABOBANK' | 'CAMT053'

export type Bucket = 'INKOMEN' | 'LEEFGELD' | 'VASTE_LASTEN' | 'SPAREN' | 'ONBEKEND'

export interface ParsedTransaction {
  id: string                   // crypto.randomUUID()
  datum: string                // YYYY-MM-DD
  bedrag: number               // positive = credit, negative = debit
  omschrijving: string
  tegenrekening: string | null // counterparty IBAN
  tegenpartij: string          // counterparty name (cleaned)
  bronBestand: string          // source filename
  bankFormat: BankFormat
}

export interface CategorizedTransaction extends ParsedTransaction {
  bucket: Bucket
  subCategorie: string | null
  isHandmatig: boolean
  regelNaam: string | null     // which rule matched
  isDuplicaat: boolean
}

export interface UserRule {
  tegenpartijPatroon: string
  bucket: Bucket
}

export interface BestandStatus {
  naam: string
  format: BankFormat | null
  status: 'PARSING' | 'KLAAR' | 'FOUT'
  foutmelding?: string
}

export interface BankOverzichtState {
  stap: 'UPLOAD' | 'REVIEW' | 'DASHBOARD'
  bestanden: BestandStatus[]
  transacties: CategorizedTransaction[]
  userRules: UserRule[]
  geselecteerdeTransacties: string[]
}
