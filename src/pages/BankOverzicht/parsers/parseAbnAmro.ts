import type { ParsedTransaction } from '../types'

export function parseAbnAmro(content: string, fileName: string): ParsedTransaction[] {
  const lines = content.split('\n').filter((l) => l.trim().length > 0)

  return lines.map((line) => {
    const cols = line.split('\t')
    const rawDate = (cols[2] ?? '').trim()
    const datum = rawDate.length === 8
      ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
      : rawDate

    const rawBedrag = (cols[3] ?? '').replace('.', '').replace(',', '.')
    const bedrag = parseFloat(rawBedrag) || 0

    const tegenrekening = (cols[4] ?? '').trim() || null

    return {
      id: crypto.randomUUID(),
      datum,
      bedrag,
      omschrijving: (cols[8] ?? '').trim(),
      tegenrekening,
      tegenpartij: (cols[5] ?? '').trim(),
      bronBestand: fileName,
      bankFormat: 'ABN_AMRO',
    }
  })
}
