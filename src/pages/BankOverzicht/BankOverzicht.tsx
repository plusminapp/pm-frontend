import { useReducer, useState, useCallback } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Chip, Step, StepButton, Stepper } from '@mui/material'
import { ChevronDown, Plus, Download } from 'lucide-react'

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
import { ExportButtons } from './components/ExportButtons'
import { PotjesBeheerDialog } from './components/PotjesBeheerDialog'
import { importRules, exportRules } from './export/exportRules'
import type { BankFormat, ParsedTransaction, CategorizedTransaction } from './types'

function readFileAsText(file: File): Promise<string> {
  const lowerName = file.name.toLowerCase()
  const isUtf8 = lowerName.endsWith('.xml') || lowerName.endsWith('.json')
  const encoding = isUtf8 ? 'utf-8' : 'windows-1252'
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

export default function BankOverzicht() {
  const [state, dispatch] = useReducer(bankOverzichtReducer, initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [potjesOpen, setPotjesOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [regelsImportStatus, setRegelsImportStatus] = useState<{ bericht: string; fout: boolean } | null>(null)

  const handleFiles = useCallback(async (files: File[]) => {
    setIsLoading(true)
    const jsonFiles = files.filter((f) => f.name.toLowerCase().endsWith('.json'))
    const bankFiles = files.filter((f) => !f.name.toLowerCase().endsWith('.json'))

    for (const file of jsonFiles) {
      try {
        const content = await readFileAsText(file)
        const { userRules, learnedRules, potjes } = importRules(content)
        dispatch({ type: 'REGELS_IMPORTEREN', userRules, learnedRules, potjes })
        setRegelsImportStatus({
          bericht: `${file.name}: ${userRules.length + learnedRules.length + potjes.length} regels/potjes geladen`,
          fout: false,
        })
      } catch (err) {
        setRegelsImportStatus({ bericht: `${file.name}: ${String(err)}`, fout: true })
      }
    }

    if (bankFiles.length > 0) {
      dispatch({ type: 'BESTANDEN_TOEVOEGEN', bestanden: bankFiles })
    }

    // Parse all files first
    const fileResults: { naam: string; txs: CategorizedTransaction[] }[] = []
    for (const file of bankFiles) {
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
      const allTxs = [...state.transacties, ...allNewTxs]
      const year = detectDominantYear(allTxs)
      setSelectedYear(year)
      dispatch({ type: 'NAAR_KOPPELEN' })
    }
    setIsLoading(false)
  }, [state.userRules, state.learnedRules, state.transacties])

  const jaar = selectedYear ?? detectDominantYear(state.transacties)
  const jaarFiltered = state.transacties.filter((t) => t.datum.startsWith(String(jaar)))
  const onbekendCount = jaarFiltered.filter((t) => t.bucket === 'ONBEKEND').length
  const onbekendTotal = jaarFiltered
    .filter((t) => t.bucket === 'ONBEKEND')
    .reduce((s, t) => s + t.bedrag, 0)

  const availableYears = [...new Set(
    state.transacties.map((t) => parseInt(t.datum.slice(0, 4), 10)).filter((y) => !isNaN(y)),
  )].sort()

  const stapIndex = { WELKOM: 0, UPLOAD: 1, KOPPELEN: 2, GEBRUIKEN: 3 }[state.stap]
  const heeftTransacties = state.transacties.length > 0

  return (
    <div>
      {/* ── Stepper ──────────────────────────────────────────────────────── */}
      <Stepper nonLinear activeStep={stapIndex} sx={{ mb: 4 }}>
        <Step completed={stapIndex > 0}>
          <StepButton sx={{ '& .MuiStepLabel-label': { color: 'text.primary' } }} onClick={() => dispatch({ type: 'NAAR_WELKOM' })}>Welkom</StepButton>
        </Step>
        <Step completed={stapIndex > 1}>
          <StepButton sx={{ '& .MuiStepLabel-label': { color: 'text.primary' } }} onClick={() => dispatch({ type: 'NAAR_UPLOAD' })}>Uploaden</StepButton>
        </Step>
        <Step completed={stapIndex > 2} disabled={!heeftTransacties}>
          <StepButton
            disabled={!heeftTransacties}
            sx={{ '& .MuiStepLabel-label': { color: heeftTransacties ? 'text.primary' : 'text.disabled' } }}
            onClick={() => dispatch({ type: 'NAAR_KOPPELEN' })}
          >
            Koppelen
          </StepButton>
        </Step>
        <Step completed={stapIndex > 3} disabled={!heeftTransacties}>
          <StepButton
            disabled={!heeftTransacties}
            sx={{ '& .MuiStepLabel-label': { color: heeftTransacties ? 'text.primary' : 'text.disabled' } }}
            onClick={() => dispatch({ type: 'NAAR_GEBRUIKEN' })}
          >
            Gebruiken
          </StepButton>
        </Step>
      </Stepper>

      {/* ── WELKOM ────────────────────────────────────────────────────────── */}
      {state.stap === 'WELKOM' && (
        <div className="mx-auto max-w-2xl py-12 space-y-6">
          <h1 className="text-2xl font-bold">Bankafschriften overzicht</h1>

          <p>
            Welkom terug? Of eigenlijk, gewoon welkom (want we weten helemaal niet of je hier al eerder
            was)!
          </p>

          <p>
            Met de functie 'Bankafschriften overzicht' maak je snel een helder overzicht van al je
            betalingen, bijvoorbeeld over het afgelopen jaar. Je uploadt hiervoor de afschriften die je
            van je bank hebt gedownload. Vervolgens maak je (budget)potjes aan en koppel je elke uitgave
            of inkomsten aan het juiste potje. Zo zie je precies hoeveel geld je met elk potje hebt
            uitgegeven of ontvangen. Dit is erg handig als je wilt beginnen met budgetteren, maar nog
            niet weet waar je geld naartoe gaat of vandaan komt.
          </p>

          <p>
            Privacy staat bij ons voorop. Daarom weten we niet of je hier al eens bent geweest. We
            onthouden niets van je vorige sessie; voor ons ben je elke keer nieuw. Heb je bij een eerder
            bezoek een koppelingsbestand gedownload? Dat bestand bevat de regels die bepalen welke
            betaling bij welk potje hoort. Je kunt dit bestand opnieuw uploaden. Samen met je (nieuwe)
            bankafschriften kun je zo direct verdergaan waar je gebleven was, voor een vliegende start.
          </p>

          <p>
            Nog een belangrijke privacy-voordeel: Je bestanden verlaten je computer of telefoon nooit.
            Alle verwerking gebeurt volledig in je browser, rechtstreeks op jouw apparaat. Twijfel je
            hierover? Geen probleem: download de app, zorg dat je bestanden op je apparaat staan en
            verbreek daarna je internetverbinding. Alles blijft gewoon werken, omdat we niets naar
            externe servers sturen. Je bent volledig zelf baas over je data.
          </p>

          <Button
            variant="contained"
            size="large"
            onClick={() => dispatch({ type: 'NAAR_UPLOAD' })}
          >
            Aan de slag
          </Button>
        </div>
      )}

      {/* ── UPLOAD ────────────────────────────────────────────────────────── */}
      {state.stap === 'UPLOAD' && (
        <div className="mx-auto max-w-2xl py-8">
          <p className="mb-8 text-gray-500">
            Upload je bankafschriften (en eventueel regelsbestanden) voor een overzicht van het jaar. Alle data blijft in je browser.
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
        </div>
      )}

      {/* ── KOPPELEN ──────────────────────────────────────────────────────── */}
      {state.stap === 'KOPPELEN' && (
        <div className="space-y-4">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-2">
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
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download className="h-4 w-4" />}
              onClick={() => exportRules(state.userRules, state.learnedRules, state.potjes)}
              disabled={state.userRules.length === 0 && state.learnedRules.length === 0 && state.potjes.length === 0}
            >
              Regels exporteren
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
            <Alert severity="warning">
              {onbekendCount} transacties zonder categorie (
              {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(onbekendTotal)}
              ) zijn uitgesloten van de totalen.
            </Alert>
          )}

          <BucketCards transacties={jaarFiltered} />

          <div className="flex flex-col gap-4">
            <Accordion disableGutters defaultExpanded={false}>
              <AccordionSummary expandIcon={<ChevronDown className="h-4 w-4" />}>
                <span className="text-sm font-semibold">Maandelijks overzicht</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <MonthlyChart transacties={jaarFiltered} />
              </AccordionDetails>
            </Accordion>
            <CategoryBreakdown
              transacties={jaarFiltered}
              potjes={state.potjes}
              onCorrectie={(ids, bucket, subCategorie) =>
                dispatch({ type: 'CATEGORIE_WIJZIGEN', transactieIds: ids, bucket, subCategorie })
              }
              onRegelToepassen={(regel) => dispatch({ type: 'REGEL_TOEPASSEN', regel })}
            />
          </div>
        </div>
      )}

      {/* ── GEBRUIKEN ─────────────────────────────────────────────────────── */}
      {state.stap === 'GEBRUIKEN' && (
        <div className="mx-auto max-w-2xl py-12">
          <p className="text-gray-500">Nog uit te werken</p>
        </div>
      )}

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
