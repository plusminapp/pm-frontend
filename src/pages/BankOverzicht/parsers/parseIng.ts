import Papa from 'papaparse'
import type { ParsedTransaction } from '../types'

export function parseIng(content: string, fileName: string): ParsedTransaction[] {
  const { data } = Papa.parse<Record<string, string>>(content, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  })

  return data.map((row) => {
    const rawDate = row['Datum'] ?? ''
    const datum = rawDate.length === 8
      ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
      : rawDate

    const rawBedrag = (row['Bedrag (EUR)'] ?? '').replace('.', '').replace(',', '.')
    const amount = parseFloat(rawBedrag) || 0
    const bedrag = (row['Af Bij'] ?? '').trim().toLowerCase() === 'af' ? -amount : amount

    const tegenrekening = (row['Tegenrekening'] ?? '').trim() || null

    return {
      id: crypto.randomUUID(),
      datum,
      bedrag,
      omschrijving: row['Mededelingen'] ?? '',
      tegenrekening,
      tegenpartij: (row['Naam / Omschrijving'] ?? '').trim(),
      bronBestand: fileName,
      bankFormat: 'ING',
    }
  })
}
