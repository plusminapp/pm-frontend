import { useReducer, useState, useCallback } from 'react'
import {
  Alert, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Tab, Tabs,
} from '@mui/material'
import { ArrowLeft, ArrowRight, Plus, Download } from 'lucide-react'

import { bankOverzichtReducer, initialState } from './bankOverzichtReducer'
import { detectFormat } from './parsers/detectFormat'
import { parseIng } from './parsers/parseIng'
import { parseAbnAmro } from './parsers/parseAbnAmro'
import { parseRabobank } from './parsers/parseRabobank'
import { parseCamt053 } from './parsers/parseCamt053'
import { applyRules } from './categorize/ruleEngine'
import { applyRecurrenceDetection } from './categorize/recurrenceDetector'
import { markDuplicates } from './parsers/detectDuplicates'
import { FileDropZone } from './components/FileDropZone'
import { BucketCards } from './components/BucketCards'
import { MonthlyChart } from './components/MonthlyChart'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { TransactionTable } from './components/TransactionTable'
import { CorrectionDialog } from './components/CorrectionDialog'
import { ExportButtons } from './components/ExportButtons'
import { PotjesBeheerDialog } from './components/PotjesBeheerDialog'
import { importRules, exportRules } from './export/exportRules'
import type { BankFormat, Bucket, ParsedTransaction, CategorizedTransaction } from './types'

function readFileAsText(file: File): Promise<string> {
  const isXml = file.name.toLowerCase().endsWith('.xml')
  const encoding = isXml ? 'utf-8' : 'windows-1252'
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Leesfout'))
    reader.readAsText(file, encoding)
  })
}

function parseByFormat(content: string, fileName: string, format: BankFormat): ParsedTransaction[] {
  switch (format) {
    case 'ING':      return parseIng(content, fileName)
    case 'ABN_AMRO': return parseAbnAmro(content, fileName)
    case 'RABOBANK': return parseRabobank(content, fileName)
    case 'CAMT053':  return parseCamt053(content, fileName)
  }
}

function detectDominantYear(txs: CategorizedTransaction[]): number {
  const counts = new Map<number, number>()
  for (const tx of txs) {
    const y = parseInt(tx.datum.slice(0, 4), 10)
    if (!isNaN(y)) counts.set(y, (counts.get(y) ?? 0) + 1)
  }
  let best = new Date().getFullYear(), max = 0
  for (const [y, n] of counts) if (n > max) { max = n; best = y }
  return best
}

const BUCKET_FILTER_TABS: { value: Bucket | 'ALLE'; label: string }[] = [
  { value: 'ALLE',        label: 'Alle' },
  { value: 'INKOMEN',      label: 'Inkomsten' },
  { value: 'LEEFGELD',     label: 'Leefgeld' },
  { value: 'VASTE_LASTEN', label: 'Vaste lasten' },
  { value: 'SPAREN',       label: 'Sparen' },
  { value: 'ONBEKEND',     label: 'Onbekend' },
]

export default function BankOverzicht() {
  const [state, dispatch] = useReducer(bankOverzichtReducer, initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [reviewBucketFilter, setReviewBucketFilter] = useState<Bucket | 'ALLE'>('ALLE')
  const [potjesOpen, setPotjesOpen] = useState(false)
  const [correctionTx, setCorrectionTx] = useState<CategorizedTransaction | null>(null)
  const [onbekendDialogOpen, setOnbekendDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [regelsImportStatus, setRegelsImportStatus] = useState<{ bericht: string; fout: boolean } | null>(null)

  const handleFiles = useCallback(async (files: File[]) => {
    setIsLoading(true)
    dispatch({ type: 'BESTANDEN_TOEVOEGEN', bestanden: files })

    // Parse all files first
    const fileResults: { naam: string; txs: CategorizedTransaction[] }[] = []
    for (const file of files) {
      try {
        const content = await readFileAsText(file)
        const format = detectFormat(content)
        if (!format) {
          dispatch({
            type: 'BESTAND_FOUT',
            bestandNaam: file.name,
            foutmelding: 'Onbekend formaat. Ondersteund: ING CSV, ABN AMRO CSV, Rabobank CSV, CAMT.053 XML.',
          })
          continue
        }
        const parsed = parseByFormat(content, file.name, format)
        const categorized = applyRecurrenceDetection(applyRules(parsed, state.userRules, state.learnedRules))
        fileResults.push({ naam: file.name, txs: categorized })
      } catch (e) {
        dispatch({ type: 'BESTAND_FOUT', bestandNaam: file.name, foutmelding: String(e) })
      }
    }

    // Mark duplicates across all files in this batch
    const allNewTxs = fileResults.flatMap((r) => r.txs)
    const withDuplicates = markDuplicates([...state.transacties, ...allNewTxs])
    // Dispatch each file's transactions with updated duplicate flags
    let offset = state.transacties.length
    for (const { naam, txs } of fileResults) {
      const flaggedTxs = withDuplicates.slice(offset, offset + txs.length)
      dispatch({ type: 'BESTAND_PARSED', bestandNaam: naam, transacties: flaggedTxs })
      offset += txs.length
    }

    if (fileResults.length > 0) {
      dispatch({ type: 'NAAR_REVIEW' })
    }
    setIsLoading(false)
  }, [state.userRules, state.learnedRules, state.transacties])

  const handleNaarDashboard = () => {
    const onbekend = state.transacties.filter((t) => t.bucket === 'ONBEKEND')
    if (onbekend.length > 0) {
      setOnbekendDialogOpen(true)
    } else {
      const year = detectDominantYear(state.transacties)
      setSelectedYear(year)
      dispatch({ type: 'NAAR_DASHBOARD' })
    }
  }

  const handleOnbekendOverslaan = () => {
    const year = detectDominantYear(state.transacties)
    setSelectedYear(year)
    setOnbekendDialogOpen(false)
    dispatch({ type: 'NAAR_DASHBOARD' })
  }

  const handleOnbekendToewijzen = () => {
    setOnbekendDialogOpen(false)
    setReviewBucketFilter('ONBEKEND')
  }

  const reviewVisible = state.transacties.filter((t) => !t.isHandmatig)
  const reviewFiltered = reviewBucketFilter === 'ALLE'
    ? reviewVisible
    : reviewVisible.filter((t) => t.bucket === reviewBucketFilter)

  const hiddenCount = state.transacties.length - reviewVisible.length

  const tabCounts = Object.fromEntries(
    BUCKET_FILTER_TABS.map(({ value }) => [
      value,
      value === 'ALLE' ? reviewVisible.length : reviewVisible.filter((t) => t.bucket === value).length,
    ])
  )

  const jaar = selectedYear ?? detectDominantYear(state.transacties)
  const jaarFiltered = state.transacties.filter((t) => t.datum.startsWith(String(jaar)))
  const onbekendCount = jaarFiltered.filter((t) => t.bucket === 'ONBEKEND').length
  const onbekendTotal = jaarFiltered
    .filter((t) => t.bucket === 'ONBEKEND')
    .reduce((s, t) => s + t.bedrag, 0)

  const availableYears = [...new Set(
    state.transacties.map((t) => parseInt(t.datum.slice(0, 4), 10)).filter((y) => !isNaN(y)),
  )].sort()

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  if (state.stap === 'UPLOAD') {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <h1 className="mb-2 text-2xl font-bold">Bank Overzicht</h1>
        <p className="mb-8 text-gray-500">
          Upload je bankafschriften voor een overzicht van het jaar. Alle data blijft in je browser.
        </p>
        <FileDropZone onFiles={handleFiles} isLoading={isLoading} />
        {regelsImportStatus && (
          <Chip
            label={regelsImportStatus.bericht}
            color={regelsImportStatus.fout ? 'error' : 'success'}
            size="small"
            className="mt-2"
            onDelete={() => setRegelsImportStatus(null)}
          />
        )}
        <div className="mt-4 text-center">
          <label className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 underline">
            Heb je eerder regels opgeslagen? Importeer ze hier.
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => {
                  try {
                    const { userRules, learnedRules, potjes } = importRules(ev.target?.result as string)
                    dispatch({ type: 'REGELS_IMPORTEREN', userRules, learnedRules, potjes })
                    setRegelsImportStatus({ bericht: `${userRules.length + learnedRules.length + potjes.length} regels/potjes geladen`, fout: false })
                  } catch (err) {
                    setRegelsImportStatus({ bericht: String(err), fout: true })
                  }
                }
                reader.readAsText(file)
                e.target.value = '' // reset so same file can be re-imported
              }}
            />
          </label>
        </div>
        <div className="mt-2 text-center">
          <Button variant="outlined" size="small" onClick={() => setPotjesOpen(true)}>
            Potjes beheren
          </Button>
        </div>
        <PotjesBeheerDialog
          open={potjesOpen}
          potjes={state.potjes}
          onSluiten={() => setPotjesOpen(false)}
          onToevoegen={(naam, bucket) => dispatch({ type: 'POTJE_TOEVOEGEN', naam, bucket })}
          onVerwijderen={(id) => dispatch({ type: 'POTJE_VERWIJDEREN', id })}
          onHernoemen={(id, naam) => dispatch({ type: 'POTJE_HERNOEMEN', id, naam })}
        />
      </div>
    )
  }

  // ── REVIEW ────────────────────────────────────────────────────────────────
  if (state.stap === 'REVIEW') {
    const duplicatenAantal = state.transacties.filter((t) => t.isDuplicaat).length

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Transacties controleren</h1>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={() => { dispatch({ type: 'NAAR_UPLOAD' }); setRegelsImportStatus(null) }}
            >
              Bestanden toevoegen
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download className="h-4 w-4" />}
              onClick={() => exportRules(state.userRules, state.learnedRules, state.potjes)}
              disabled={state.userRules.length === 0 && state.learnedRules.length === 0 && state.potjes.length === 0}
            >
              Regels exporteren
            </Button>
            <Button variant="outlined" size="small" onClick={() => setPotjesOpen(true)}>
              Potjes
            </Button>
            <Button
              variant="contained"
              size="small"
              endIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleNaarDashboard}
            >
              Naar dashboard
            </Button>
          </div>
        </div>

        {/* File status */}
        <div className="flex flex-wrap gap-2">
          {state.bestanden.length <= 3
            ? state.bestanden.map((b) => (
                <Chip
                  key={b.naam}
                  label={b.naam}
                  color={b.status === 'FOUT' ? 'error' : b.status === 'KLAAR' ? 'success' : 'default'}
                  icon={b.status === 'PARSING' ? <CircularProgress size={14} /> : undefined}
                  size="small"
                />
              ))
            : (() => {
                const fout = state.bestanden.filter((b) => b.status === 'FOUT').length
                const parsing = state.bestanden.filter((b) => b.status === 'PARSING').length
                return (
                  <>
                    <Chip
                      label={`${state.bestanden.length} bestanden geladen`}
                      color={fout > 0 ? 'error' : parsing > 0 ? 'default' : 'success'}
                      icon={parsing > 0 ? <CircularProgress size={14} /> : undefined}
                      size="small"
                    />
                    {fout > 0 && <Chip label={`${fout} fout`} color="error" size="small" />}
                  </>
                )
              })()
          }
        </div>

        {/* Duplicate warning */}
        {duplicatenAantal > 0 && (
          <Alert
            severity="warning"
            action={
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  const ids = state.transacties.filter((t) => t.isDuplicaat).map((t) => t.id)
                  dispatch({ type: 'CATEGORIE_WIJZIGEN', transactieIds: ids, bucket: 'ONBEKEND', subCategorie: null })
                }}
              >
                {duplicatenAantal} duplicaten naar Onbekend
              </Button>
            }
          >
            {duplicatenAantal} mogelijke duplicaten gedetecteerd.
          </Alert>
        )}

        {/* Bucket filter tabs */}
        <Tabs
          value={reviewBucketFilter}
          onChange={(_, v) => setReviewBucketFilter(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {BUCKET_FILTER_TABS.map(({ value, label }) => (
            <Tab key={value} value={value} label={`${label} (${tabCounts[value]})`} />
          ))}
        </Tabs>

        {hiddenCount > 0 && (
          <p className="text-xs text-gray-400">{hiddenCount} gecategoriseerde items verborgen</p>
        )}

        <TransactionTable
          transacties={reviewFiltered}
          onEdit={(tx) => setCorrectionTx(tx)}
        />

        {correctionTx && (
          <CorrectionDialog
            open
            transacties={[correctionTx]}
            potjes={state.potjes}
            onSluiten={() => setCorrectionTx(null)}
            onCorrectie={(ids, bucket, subCategorie) => {
              dispatch({ type: 'CATEGORIE_WIJZIGEN', transactieIds: ids, bucket, subCategorie })
              setCorrectionTx(null)
            }}
            onRegelToepassen={(regel) => {
              dispatch({ type: 'REGEL_TOEPASSEN', regel })
              setCorrectionTx(null)
            }}
          />
        )}

        <PotjesBeheerDialog
          open={potjesOpen}
          potjes={state.potjes}
          onSluiten={() => setPotjesOpen(false)}
          onToevoegen={(naam, bucket) => dispatch({ type: 'POTJE_TOEVOEGEN', naam, bucket })}
          onVerwijderen={(id) => dispatch({ type: 'POTJE_VERWIJDEREN', id })}
          onHernoemen={(id, naam) => dispatch({ type: 'POTJE_HERNOEMEN', id, naam })}
        />

        {/* ONBEKEND prompt dialog */}
        <Dialog open={onbekendDialogOpen} onClose={() => setOnbekendDialogOpen(false)}>
          <DialogTitle>Ongecategoriseerde transacties</DialogTitle>
          <DialogContent>
            Er zijn nog {state.transacties.filter((t) => t.bucket === 'ONBEKEND').length} transacties
            zonder categorie. Wil je deze eerst toewijzen?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleOnbekendOverslaan}>Overslaan</Button>
            <Button onClick={handleOnbekendToewijzen} variant="contained">Toewijzen</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => dispatch({ type: 'NAAR_REVIEW' })}
        >
          Categorieën aanpassen
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Plus className="h-4 w-4" />}
          onClick={() => dispatch({ type: 'NAAR_UPLOAD' })}
        >
          Bestanden toevoegen
        </Button>
        <Button variant="outlined" size="small" onClick={() => setPotjesOpen(true)}>
          Potjes
        </Button>

        {availableYears.length > 1 && (
          <div className="flex items-center gap-1">
            {availableYears.map((y) => (
              <Chip
                key={y}
                label={y}
                color={y === jaar ? 'primary' : 'default'}
                onClick={() => setSelectedYear(y)}
                clickable
                size="small"
              />
            ))}
          </div>
        )}

        <div className="ml-auto">
          <ExportButtons
            transacties={jaarFiltered}
            jaar={jaar}
            userRules={state.userRules}
            learnedRules={state.learnedRules}
            potjes={state.potjes}
          />
        </div>
      </div>

      {onbekendCount > 0 && (
        <Alert
          severity="warning"
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => { dispatch({ type: 'NAAR_REVIEW' }); setReviewBucketFilter('ONBEKEND') }}
            >
              Toewijzen
            </Button>
          }
        >
          {onbekendCount} transacties zonder categorie (
          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(onbekendTotal)}
          ) zijn uitgesloten van de totalen.
        </Alert>
      )}

      <BucketCards transacties={jaarFiltered} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyChart transacties={jaarFiltered} />
        <CategoryBreakdown
          transacties={jaarFiltered}
          potjes={state.potjes}
          onCorrectie={(ids, bucket, subCategorie) =>
            dispatch({ type: 'CATEGORIE_WIJZIGEN', transactieIds: ids, bucket, subCategorie })
          }
          onRegelToepassen={(regel) => dispatch({ type: 'REGEL_TOEPASSEN', regel })}
        />
      </div>
      <PotjesBeheerDialog
        open={potjesOpen}
        potjes={state.potjes}
        onSluiten={() => setPotjesOpen(false)}
        onToevoegen={(naam, bucket) => dispatch({ type: 'POTJE_TOEVOEGEN', naam, bucket })}
        onVerwijderen={(id) => dispatch({ type: 'POTJE_VERWIJDEREN', id })}
        onHernoemen={(id, naam) => dispatch({ type: 'POTJE_HERNOEMEN', id, naam })}
      />
    </div>
  )
}
