import Papa from 'papaparse'
import type { ParsedTransaction } from '../types'

export function parseRabobank(content: string, fileName: string): ParsedTransaction[] {
  const { data } = Papa.parse<Record<string, string>>(content, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  })

  return data.map((row) => {
    const rawBedrag = (row['Bedrag'] ?? '').replace('.', '').replace(',', '.')
    const bedrag = parseFloat(rawBedrag) || 0

    const tegenrekening = (row['Tegenrekening IBAN/BBAN'] ?? '').trim() || null

    return {
      id: crypto.randomUUID(),
      datum: row['Datum'] ?? '',
      bedrag,
      omschrijving: (row['Omschrijving-1'] || row['Betalingskenmerk'] || '').trim(),
      tegenrekening,
      tegenpartij: (row['Naam tegenpartij'] ?? '').trim(),
      bronBestand: fileName,
      bankFormat: 'RABOBANK',
    }
  })
}
