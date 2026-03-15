import { useState } from 'react'
import { Tabs, Tab } from '@mui/material'
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react'
import { CorrectionDialog } from './CorrectionDialog'
import { TransactionTable } from './TransactionTable'
import type { CategorizedTransaction, Bucket, UserRule } from '../types'

const TABS: { value: Bucket | 'ALLE'; label: string }[] = [
  { value: 'ALLE',        label: 'Alle' },
  { value: 'INKOMEN',      label: 'Inkomsten' },
  { value: 'LEEFGELD',     label: 'Leefgeld' },
  { value: 'VASTE_LASTEN', label: 'Vaste lasten' },
  { value: 'SPAREN',       label: 'Sparen' },
  { value: 'ONBEKEND',     label: 'Onbekend' },
]

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)
}

function buildCounterpartyRanking(transacties: CategorizedTransaction[]) {
  const map = new Map<string, { totaal: number; count: number; bucket: Bucket; txs: CategorizedTransaction[] }>()
  for (const tx of transacties) {
    const entry = map.get(tx.tegenpartij) ?? { totaal: 0, count: 0, bucket: tx.bucket, txs: [] }
    entry.totaal += tx.bedrag
    entry.count += 1
    entry.txs.push(tx)
    map.set(tx.tegenpartij, entry)
  }
  return [...map.entries()]
    .sort((a, b) => Math.abs(b[1].totaal) - Math.abs(a[1].totaal))
    .map(([naam, data]) => ({
      naam,
      ...data,
      maandGemiddeld: data.totaal / 12,
    }))
}

interface Props {
  transacties: CategorizedTransaction[]
  onCorrectie: (ids: string[], bucket: Bucket) => void
  onRegelToepassen: (regel: UserRule) => void
}

export function CategoryBreakdown({ transacties, onCorrectie, onRegelToepassen }: Props) {
  const [activeTab, setActiveTab] = useState<Bucket | 'ALLE'>('ALLE')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dialogTxs, setDialogTxs] = useState<CategorizedTransaction[]>([])

  const filtered = activeTab === 'ALLE'
    ? transacties
    : transacties.filter((t) => t.bucket === activeTab)

  const ranking = buildCounterpartyRanking(filtered)

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 pt-2">
        <Tabs
          value={activeTab}
          onChange={(_, v) => { setActiveTab(v); setExpanded(null) }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map(({ value, label }) => (
            <Tab key={value} value={value} label={label} />
          ))}
        </Tabs>
      </div>

      <div className="divide-y">
        {ranking.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">Geen transacties</p>
        )}
        {ranking.map(({ naam, totaal, count, txs, maandGemiddeld }) => (
          <div key={naam}>
            <div
              role="button"
              tabIndex={0}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50"
              onClick={() => setExpanded(expanded === naam ? null : naam)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setExpanded(expanded === naam ? null : naam)
                }
              }}
            >
              {expanded === naam
                ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
              }
              <span className="flex-1 font-medium">{naam}</span>
              <span className="text-xs text-gray-400">{count}×</span>
              <span className="text-xs text-gray-400">gem. {formatEur(maandGemiddeld)}/mnd</span>
              <span className={`font-mono text-sm font-semibold ${totaal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatEur(totaal)}
              </span>
              <button
                className="ml-2 rounded p-1 hover:bg-gray-100"
                aria-label={`Categorie wijzigen voor ${naam}`}
                onClick={(e) => { e.stopPropagation(); setDialogTxs(txs) }}
              >
                <Pencil className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>

            {expanded === naam && (
              <div className="border-t bg-gray-50 px-4 py-3">
                <TransactionTable
                  transacties={txs}
                  geselecteerd={[]}
                  onSelectie={() => {}}
                  compact
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {dialogTxs.length > 0 && (
        <CorrectionDialog
          open
          transacties={dialogTxs}
          onSluiten={() => setDialogTxs([])}
          onCorrectie={(ids, bucket) => { onCorrectie(ids, bucket); setDialogTxs([]) }}
          onRegelToepassen={(regel) => { onRegelToepassen(regel); setDialogTxs([]) }}
        />
      )}
    </div>
  )
}
