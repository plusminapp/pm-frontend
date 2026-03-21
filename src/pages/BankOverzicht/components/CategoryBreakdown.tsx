import { useMemo, useState } from 'react'
import { Button, Checkbox, Chip, IconButton, InputAdornment, Tab, Tabs, TextField } from '@mui/material'
import { ChevronDown, ChevronRight, CircleHelp, Home, Pencil, PiggyBank, ShoppingCart, TrendingUp, X } from 'lucide-react'
import { CorrectionDialog } from './CorrectionDialog'
import { TransactionTable } from './TransactionTable'
import { formatTegenpartijVoorWeergave, titleCaseWoorden } from '../displayTegenpartij'
import type { CategorizedTransaction, Bucket, Potje, UserRule } from '../types'

const BUCKET_COLORS: Record<Bucket, 'success' | 'error' | 'primary' | 'warning' | 'default'> = {
  INKOMEN: 'success',
  LEEFGELD: 'error',
  VASTE_LASTEN: 'primary',
  SPAREN: 'warning',
  ONBEKEND: 'default',
}

const BUCKET_ICONS: Record<Bucket, React.ComponentType<{ className?: string }>> = {
  INKOMEN: TrendingUp,
  LEEFGELD: ShoppingCart,
  VASTE_LASTEN: Home,
  SPAREN: PiggyBank,
  ONBEKEND: CircleHelp,
}

const TABS: { value: Bucket | 'ALLE'; label: string }[] = [
  { value: 'ALLE', label: 'Alle' },
  { value: 'INKOMEN', label: 'Inkomsten' },
  { value: 'LEEFGELD', label: 'Leefgeld' },
  { value: 'VASTE_LASTEN', label: 'Vaste lasten' },
  { value: 'SPAREN', label: 'Sparen' },
  { value: 'ONBEKEND', label: 'Onbekend' },
]

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)
}

type GroepeerRegel = Pick<UserRule, 'tegenpartijPatroon' | 'omschrijvingPatroon' | 'richting'>

function normalizePattern(pattern: string): string {
  return pattern.trim().toLowerCase()
}

function bepaalTegenpartijPatroon(
  tx: CategorizedTransaction,
  userRules: UserRule[],
  learnedRules: UserRule[],
): string | null {
  const regelNaam = tx.regelNaam?.trim() ?? ''

  if (regelNaam.startsWith('regel:')) {
    const patroon = regelNaam.slice('regel:'.length).trim()
    if (patroon) return normalizePattern(patroon)
  }
  if (regelNaam.startsWith('geleerd:')) {
    const patroon = regelNaam.slice('geleerd:'.length).trim()
    if (patroon) return normalizePattern(patroon)
  }

  const tegenpartij = formatTegenpartijVoorWeergave(tx.tegenpartij).toLowerCase()
  const omschrijving = tx.omschrijving.toLowerCase()
  const regelMatches = (rule: GroepeerRegel) => {
    const pattern = normalizePattern(rule.tegenpartijPatroon)
    if (!pattern) return false
    const richtingMatch = !rule.richting
      || (rule.richting === 'debit' && tx.bedrag < 0)
      || (rule.richting === 'credit' && tx.bedrag > 0)
    if (!richtingMatch) return false
    if (tegenpartij.startsWith(pattern)) return true
    return Boolean(rule.omschrijvingPatroon && omschrijving.startsWith(normalizePattern(rule.omschrijvingPatroon)))
  }

  const candidates = [...userRules, ...learnedRules]
    .filter(regelMatches)
    .sort((a, b) => b.tegenpartijPatroon.length - a.tegenpartijPatroon.length)

  return candidates[0] ? normalizePattern(candidates[0].tegenpartijPatroon) : null
}

function bepaalGroepNaam(
  tx: CategorizedTransaction,
  userRules: UserRule[],
  learnedRules: UserRule[],
): string {
  const patroon = bepaalTegenpartijPatroon(tx, userRules, learnedRules)
  return patroon ?? tx.tegenpartij
}

function isPatroonGedrevenGroep(
  tx: CategorizedTransaction,
  userRules: UserRule[],
  learnedRules: UserRule[],
): boolean {
  return Boolean(bepaalTegenpartijPatroon(tx, userRules, learnedRules))
}

function bepaalGezamenlijkNaamdeel(namen: string[]): string {
  if (namen.length === 0) return ''
  if (namen.length === 1) return namen[0].trim()

  const lowerNamen = namen.map((n) => n.toLowerCase())
  const kortsteNaam = [...lowerNamen].sort((a, b) => a.length - b.length)[0]

  for (let lengte = kortsteNaam.length; lengte >= 2; lengte -= 1) {
    for (let start = 0; start <= kortsteNaam.length - lengte; start += 1) {
      const kandidaat = kortsteNaam.slice(start, start + lengte)
      if (!/[a-z0-9]/i.test(kandidaat)) continue
      if (!lowerNamen.every((naam) => naam.includes(kandidaat))) continue

      const opgeschoond = kandidaat
        .replace(/^[\s\-_,.;:()]+|[\s\-_,.;:()]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      if (opgeschoond.length >= 2) return opgeschoond
    }
  }

  return ''
}

function buildCounterpartyRanking(
  transacties: CategorizedTransaction[],
  userRules: UserRule[],
  learnedRules: UserRule[],
) {
  const map = new Map<string, { naam: string; totaal: number; count: number; bucket: Bucket; txs: CategorizedTransaction[]; patroonGedreven: boolean }>()
  for (const tx of transacties) {
    const groupNaam = bepaalGroepNaam(tx, userRules, learnedRules)
    const groupKey = normalizePattern(groupNaam) || groupNaam
    const entry = map.get(groupKey) ?? { naam: groupNaam, totaal: 0, count: 0, bucket: tx.bucket, txs: [], patroonGedreven: false }
    entry.totaal += tx.bedrag
    entry.count += 1
    entry.txs.push(tx)
    entry.patroonGedreven = entry.patroonGedreven || isPatroonGedrevenGroep(tx, userRules, learnedRules)
    map.set(groupKey, entry)
  }
  return [...map.values()]
    .sort((a, b) => a.naam.localeCompare(b.naam, 'nl'))
    .map((data) => ({
      ...data,
      maandGemiddeld: data.totaal / 12,
    }))
}

interface Props {
  transacties: CategorizedTransaction[]
  potjes: Potje[]
  userRules: UserRule[]
  learnedRules: UserRule[]
  onCorrectie: (ids: string[], bucket: Bucket, potje: string | null, groepCriterium?: string, zonderRegel?: boolean) => void
  onPotjeToevoegen: (naam: string, bucket: Exclude<Bucket, 'ONBEKEND'>) => void
}

type CounterpartyGroup = {
  key: string
  naam: string
  patroonGedreven: boolean
  totaal: number
  count: number
  txs: CategorizedTransaction[]
  maandGemiddeld: number
}

type GroupMerge = {
  id: string
  naam: string
  criterium: string
  leden: string[]
}

export function CategoryBreakdown({ transacties, potjes, userRules, learnedRules, onCorrectie, onPotjeToevoegen }: Props) {
  const [activeTab, setActiveTab] = useState<Bucket | 'ALLE'>('ALLE')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dialogTxs, setDialogTxs] = useState<CategorizedTransaction[]>([])
  const [dialogGroupKey, setDialogGroupKey] = useState<string | null>(null)
  const [dialogGroupNaam, setDialogGroupNaam] = useState('')
  const [dialogForceLeefgeldEenmalig, setDialogForceLeefgeldEenmalig] = useState(false)
  const [tegenpartijFilter, setTegenpartijFilter] = useState('')
  const [toonInkomsten, setToonInkomsten] = useState(true)
  const [toonUitgaven, setToonUitgaven] = useState(true)
  const [geselecteerdeGroepen, setGeselecteerdeGroepen] = useState<string[]>([])
  const [geselecteerdeTransacties, setGeselecteerdeTransacties] = useState<string[]>([])
  const [samengevoegdeGroepen, setSamengevoegdeGroepen] = useState<GroupMerge[]>([])
  const [groupNameOverrides, setGroupNameOverrides] = useState<Record<string, string>>({})

  const tabCounts = useMemo(() => (
    Object.fromEntries(
      TABS.map(({ value }) => [
        value,
        value === 'ALLE'
          ? transacties.length
          : transacties.filter((t) => t.bucket === value).length,
      ]),
    ) as Record<Bucket | 'ALLE', number>
  ), [transacties])

  const filtered = activeTab === 'ALLE'
    ? transacties
    : transacties.filter((t) => t.bucket === activeTab)

  const basisRanking: CounterpartyGroup[] = buildCounterpartyRanking(filtered, userRules, learnedRules).map((item) => ({
    ...item,
    key: item.naam,
  }))
  const basisMap = new Map(basisRanking.map((item) => [item.naam, item]))

  const mergedGroups: CounterpartyGroup[] = samengevoegdeGroepen
    .map((merge) => {
      const leden = merge.leden
        .map((naam) => basisMap.get(naam))
        .filter((item): item is CounterpartyGroup => Boolean(item))
      if (leden.length === 0) return null
      const totaal = leden.reduce((sum, item) => sum + item.totaal, 0)
      const count = leden.reduce((sum, item) => sum + item.count, 0)
      const txs = leden.flatMap((item) => item.txs)
      return {
        key: `merge:${merge.id}`,
        naam: merge.naam,
        patroonGedreven: false,
        totaal,
        count,
        txs,
        maandGemiddeld: totaal / 12,
      }
    })
    .filter((item): item is CounterpartyGroup => Boolean(item))

  const ledenVanMerges = new Set(samengevoegdeGroepen.flatMap((merge) => merge.leden))
  const ranking: CounterpartyGroup[] = [
    ...basisRanking.filter((item) => !ledenVanMerges.has(item.naam)),
    ...mergedGroups,
  ].sort((a, b) => a.naam.localeCompare(b.naam, 'nl'))

  const getGroupNaamVoorWeergave = (group: CounterpartyGroup) => {
    const override = groupNameOverrides[group.key]
    if (override) return override
    return formatTegenpartijVoorWeergave(group.naam)
  }

  const isAanHetFilteren = tegenpartijFilter.length > 0
  const rankingFiltered = ranking.filter((group) => {
    const naamMatch = getGroupNaamVoorWeergave(group).toLowerCase().startsWith(tegenpartijFilter.toLowerCase())
    if (!naamMatch) return false
    if (group.totaal > 0 && !toonInkomsten) return false
    if (group.totaal < 0 && !toonUitgaven) return false
    if (group.totaal === 0 && !(toonInkomsten || toonUitgaven)) return false
    return true
  })
  const zichtbareGroepen = rankingFiltered.map(({ key }) => key)
  const geselecteerdSet = new Set(geselecteerdeGroepen)
  const geselecteerdeTxSet = new Set(geselecteerdeTransacties)
  const bulkEenmaligBeschikbaar = activeTab === 'ONBEKEND' && !toonInkomsten && toonUitgaven
  const alleZichtbareGeselecteerd =
    zichtbareGroepen.length > 0 && zichtbareGroepen.every((key) => geselecteerdSet.has(key))
  const deelsZichtbaarGeselecteerd =
    zichtbareGroepen.some((key) => geselecteerdSet.has(key)) && !alleZichtbareGeselecteerd

  const toggleGroepSelectie = (key: string) => {
    setGeselecteerdeGroepen((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    )
  }

  const toggleAllesZichtbaar = (checked: boolean) => {
    if (checked) {
      setGeselecteerdeGroepen((current) => [...new Set([...current, ...zichtbareGroepen])])
      return
    }
    const zichtbaarSet = new Set(zichtbareGroepen)
    setGeselecteerdeGroepen((current) => current.filter((key) => !zichtbaarSet.has(key)))
  }

  const samenvoegen = () => {
    const groepen = ranking.filter(({ key }) => geselecteerdSet.has(key))
    if (groepen.length < 2) return

    const namen = groepen.map((g) => getGroupNaamVoorWeergave(g))
    const fallbackNaam = [...namen].sort((a, b) => a.localeCompare(b, 'nl'))[0]
    const nieuweNaam = titleCaseWoorden(bepaalGezamenlijkNaamdeel(namen) || fallbackNaam)
    if (!nieuweNaam) return

    const leden = groepen.flatMap((group) => {
      if (group.key.startsWith('merge:')) {
        const mergeId = group.key.slice('merge:'.length)
        const merge = samengevoegdeGroepen.find((item) => item.id === mergeId)
        return merge?.leden ?? []
      }
      return [group.naam]
    })
    const uniekeLeden = [...new Set(leden)]
    const mergeCriterium = (bepaalGezamenlijkNaamdeel(uniekeLeden) || uniekeLeden[0] || '').trim()
    const nieuweMerge: GroupMerge = {
      id: crypto.randomUUID(),
      naam: nieuweNaam,
      criterium: mergeCriterium,
      leden: uniekeLeden,
    }
    const teVerwijderenMergeIds = new Set(
      groepen
        .filter((group) => group.key.startsWith('merge:'))
        .map((group) => group.key.slice('merge:'.length)),
    )

    setSamengevoegdeGroepen((current) => [
      ...current.filter((merge) => !teVerwijderenMergeIds.has(merge.id)),
      nieuweMerge,
    ])
    setGeselecteerdeGroepen([])
    setExpanded(`merge:${nieuweMerge.id}`)
  }

  const toggleTransactieSelectie = (txId: string, checked: boolean) => {
    setGeselecteerdeTransacties((current) => {
      if (checked) return current.includes(txId) ? current : [...current, txId]
      return current.filter((id) => id !== txId)
    })
  }

  const toggleAlleTransactiesInGroep = (txIds: string[], checked: boolean) => {
    setGeselecteerdeTransacties((current) => {
      if (checked) return [...new Set([...current, ...txIds])]
      const toRemove = new Set(txIds)
      return current.filter((id) => !toRemove.has(id))
    })
  }

  const openBulkLeefgeldEenmalig = () => {
    const geselecteerdeTxs = rankingFiltered
      .flatMap((group) => group.txs)
      .filter((tx) => geselecteerdeTxSet.has(tx.id) && tx.bucket === 'ONBEKEND' && tx.bedrag < 0)
    if (geselecteerdeTxs.length === 0) return
    setDialogTxs(geselecteerdeTxs)
    setDialogGroupKey(null)
    setDialogGroupNaam('')
    setDialogForceLeefgeldEenmalig(true)
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 py-2">
        <div className="min-w-0">
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              setActiveTab(v)
              setExpanded(null)
              setGeselecteerdeGroepen([])
              setGeselecteerdeTransacties([])
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {TABS.map(({ value, label }) => (
              <Tab key={value} value={value} label={`${label} (${tabCounts[value]})`} />
            ))}
          </Tabs>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Checkbox
            size="small"
            color="success"
            checked={alleZichtbareGeselecteerd}
            indeterminate={deelsZichtbaarGeselecteerd}
            onChange={(_, checked) => toggleAllesZichtbaar(checked)}
            inputProps={{ 'aria-label': 'Alle zichtbare groepen (de)selecteren' }}
            sx={{ visibility: isAanHetFilteren ? 'visible' : 'hidden' }}
          />
          <TextField
            size="small"
            label="Tegenpartij"
            placeholder="Filter"
            value={tegenpartijFilter}
            onChange={(e) => {
              const value = e.target.value
              setTegenpartijFilter(value)
              if (value === '') {
                setGeselecteerdeGroepen([])
              }
            }}
            slotProps={{
              inputLabel: { sx: { color: 'text.disabled' } },
              input: {
                endAdornment: tegenpartijFilter ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="filter wissen"
                      onClick={() => {
                        setTegenpartijFilter('')
                        setGeselecteerdeGroepen([])
                      }}
                      edge="end"
                    >
                      <X size={14} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={samenvoegen}
            disabled={geselecteerdeGroepen.length < 2}
          >
            Samenvoegen ({geselecteerdeGroepen.length})
          </Button>
          <Chip
            size="small"
            label="Inkomsten"
            color="success"
            variant={toonInkomsten ? 'filled' : 'outlined'}
            onClick={() => {
              setToonInkomsten((current) => {
                const next = !current
                if (activeTab !== 'ONBEKEND' || next || !toonUitgaven) setGeselecteerdeTransacties([])
                return next
              })
            }}
            sx={{ ml: 2 }}
          />
          <Chip
            size="small"
            label="Uitgaven"
            color="error"
            variant={toonUitgaven ? 'filled' : 'outlined'}
            onClick={() => {
              setToonUitgaven((current) => {
                const next = !current
                if (activeTab !== 'ONBEKEND' || !next || toonInkomsten) setGeselecteerdeTransacties([])
                return next
              })
            }}
          />
          <div className="ml-auto" />
          {bulkEenmaligBeschikbaar && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={openBulkLeefgeldEenmalig}
              disabled={geselecteerdeTransacties.length === 0}
            >
              Koppel eenmalig aan leefgeld ({geselecteerdeTransacties.length})
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y">
        {rankingFiltered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">Geen transacties</p>
        )}
        {rankingFiltered.map((group) => {
          const { key, patroonGedreven, totaal, count, txs, maandGemiddeld } = group
          const weergaveNaam = getGroupNaamVoorWeergave(group)
          return (
            <div key={key}>
              <div
                role="button"
                tabIndex={0}
                className="group flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50"
                onClick={() => { setExpanded(expanded === key ? null : key) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExpanded(expanded === key ? null : key)
                  }
                }}
              >
                {expanded === key
                  ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                }
                {isAanHetFilteren && (
                  <Checkbox
                    size="small"
                    color="success"
                    checked={geselecteerdSet.has(key)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleGroepSelectie(key)}
                    inputProps={{ 'aria-label': `Groep ${weergaveNaam} selecteren om samen te voegen` }}
                  />
                )}
                <span className="flex-1 font-medium">
                  {weergaveNaam}
                  {patroonGedreven && (
                    <span className="ml-2 text-xs font-normal text-gray-500">(op patroon)</span>
                  )}
                </span>
                <span className="flex flex-wrap gap-1">
                  {[...new Map(txs.map((tx) => [`${tx.bucket}|${tx.potje ?? ''}`, tx])).values()].map((tx) => {
                    const BucketIcon = BUCKET_ICONS[tx.bucket]
                    return (
                      <Chip
                        key={`${tx.bucket}|${tx.potje ?? ''}`}
                        label={tx.potje ?? ''}
                        icon={<BucketIcon className="h-3.5 w-3.5" />}
                        color={BUCKET_COLORS[tx.bucket]}
                        size="small"
                        variant={tx.isHandmatig ? 'filled' : 'outlined'}
                        sx={tx.potje ? { '& .MuiChip-icon': { marginLeft: '6px' } } : { '& .MuiChip-label': { display: 'none' }, '& .MuiChip-icon': { marginLeft: '6px', marginRight: '6px' } }}
                      />
                    )
                  })}
                </span>
                <span className="text-xs text-gray-400">{count}×</span>
                <span className="text-xs text-gray-400">gem. {formatEur(maandGemiddeld)}/mnd</span>
                <span className={`font-mono text-sm font-semibold ${totaal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatEur(totaal)}
                </span>
                <button
                  className="ml-2 rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100"
                  aria-label={`Categorie wijzigen voor ${weergaveNaam}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDialogTxs(txs)
                    setDialogGroupKey(key)
                    setDialogGroupNaam(weergaveNaam)
                    setDialogForceLeefgeldEenmalig(false)
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>

              {expanded === key && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  <TransactionTable
                    transacties={txs}
                    selectable={bulkEenmaligBeschikbaar}
                    selectedIds={geselecteerdeTxSet}
                    onToggleSelect={toggleTransactieSelectie}
                    onToggleSelectAll={toggleAlleTransactiesInGroep}
                    onEdit={(tx) => {
                      setDialogTxs([tx])
                      setDialogGroupKey(key)
                      setDialogGroupNaam(weergaveNaam)
                      setDialogForceLeefgeldEenmalig(false)
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {dialogTxs.length > 0 && (
        <CorrectionDialog
          open
          transacties={dialogTxs}
          potjes={potjes}
          groepNaam={dialogGroupNaam}
          forceLeefgeldEenmalig={dialogForceLeefgeldEenmalig}
          onSluiten={() => {
            setDialogTxs([])
            setDialogGroupKey(null)
            setDialogGroupNaam('')
            setDialogForceLeefgeldEenmalig(false)
          }}
          onPotjeToevoegen={onPotjeToevoegen}
          onGroepNaamWijzigen={(nieuweNaam) => {
            if (!dialogGroupKey) return
            if (dialogGroupKey.startsWith('merge:')) {
              const mergeId = dialogGroupKey.slice('merge:'.length)
              setSamengevoegdeGroepen((current) =>
                current.map((merge) => merge.id === mergeId ? { ...merge, naam: nieuweNaam } : merge),
              )
            } else {
              setGroupNameOverrides((current) => ({ ...current, [dialogGroupKey]: nieuweNaam }))
            }
            setDialogGroupNaam(nieuweNaam)
          }}
          onCorrectie={(ids, bucket, potje, groepNaam, zonderRegel) => {
            const geselecteerdeGroep = dialogGroupKey
              ? ranking.find((group) => group.key === dialogGroupKey)
              : undefined
            const isGroepCorrectie = Boolean(
              (dialogGroupKey && dialogGroupKey.startsWith('merge:'))
              || (geselecteerdeGroep && geselecteerdeGroep.count > 1),
            )
            const groepCriterium = isGroepCorrectie
              ? (groepNaam?.trim() || dialogGroupNaam.trim() || undefined)
              : undefined
            if (zonderRegel) {
              onCorrectie(ids, bucket, potje, groepCriterium, true)
            } else {
              onCorrectie(ids, bucket, potje, groepCriterium)
            }
            setDialogTxs([])
            setDialogGroupKey(null)
            setDialogGroupNaam('')
            setDialogForceLeefgeldEenmalig(false)
            setGeselecteerdeTransacties([])
          }}
        />
      )}
    </div>
  )
}
