import { Checkbox, Chip } from '@mui/material'
import type { CategorizedTransaction, Bucket } from '../types'

const BUCKET_COLORS: Record<Bucket, 'success' | 'error' | 'primary' | 'warning' | 'default'> = {
  INKOMEN: 'success',
  LEEFGELD: 'error',
  VASTE_LASTEN: 'primary',
  SPAREN: 'warning',
  ONBEKEND: 'default',
}

const BUCKET_LABELS: Record<Bucket, string> = {
  INKOMEN: 'Inkomsten',
  LEEFGELD: 'Leefgeld',
  VASTE_LASTEN: 'Vaste lasten',
  SPAREN: 'Sparen',
  ONBEKEND: 'Onbekend',
}

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)
}

interface Props {
  transacties: CategorizedTransaction[]
  geselecteerd: string[]
  onSelectie: (ids: string[]) => void
  compact?: boolean
}

export function TransactionTable({ transacties, geselecteerd, onSelectie, compact = false }: Props) {
  if (transacties.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">Geen transacties</p>
    )
  }

  const allSelected = transacties.length > 0 && transacties.every((t) => geselecteerd.includes(t.id))
  const someSelected = transacties.some((t) => geselecteerd.includes(t.id)) && !allSelected

  const toggleAll = () => {
    onSelectie(allSelected ? [] : transacties.map((t) => t.id))
  }

  const toggleOne = (id: string) => {
    onSelectie(
      geselecteerd.includes(id)
        ? geselecteerd.filter((x) => x !== id)
        : [...geselecteerd, id],
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="w-10 px-3 py-2">
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                inputProps={{ 'aria-label': 'Alles selecteren' }}
              />
            </th>
            <th className="px-3 py-2 text-left font-medium">Datum</th>
            <th className="px-3 py-2 text-left font-medium">Tegenpartij</th>
            {!compact && <th className="px-3 py-2 text-left font-medium">Omschrijving</th>}
            <th className="px-3 py-2 text-right font-medium">Bedrag</th>
            <th className="px-3 py-2 text-left font-medium">Categorie</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transacties.map((tx) => (
            <tr
              key={tx.id}
              className={geselecteerd.includes(tx.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
            >
              <td className="px-3 py-2">
                <Checkbox
                  size="small"
                  checked={geselecteerd.includes(tx.id)}
                  onChange={() => toggleOne(tx.id)}
                  inputProps={{ 'aria-label': `Selecteer ${tx.tegenpartij}` }}
                />
              </td>
              <td className="px-3 py-2 text-gray-500">{tx.datum}</td>
              <td className="px-3 py-2 font-medium">{tx.tegenpartij}</td>
              {!compact && (
                <td className="max-w-xs truncate px-3 py-2 text-gray-500">
                  {tx.omschrijving}
                </td>
              )}
              <td className={`px-3 py-2 text-right font-mono text-sm font-semibold ${tx.bedrag < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatEur(tx.bedrag)}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  <Chip
                    label={BUCKET_LABELS[tx.bucket]}
                    color={BUCKET_COLORS[tx.bucket]}
                    size="small"
                    variant={tx.isHandmatig ? 'filled' : 'outlined'}
                  />
                  {tx.isDuplicaat && (
                    <Chip label="duplicaat" color="warning" size="small" variant="outlined" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
