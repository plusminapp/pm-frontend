import type {
  BankOverzichtState,
  CategorizedTransaction,
  UserRule,
  Potje,
} from './types'
import { applyRules } from './categorize/ruleEngine'

export type BankOverzichtAction =
  | { type: 'BESTANDEN_TOEVOEGEN'; bestanden: File[] }
  | { type: 'BESTAND_PARSED'; bestandNaam: string; transacties: CategorizedTransaction[] }
  | { type: 'BESTAND_FOUT'; bestandNaam: string; foutmelding: string }
  | { type: 'CATEGORIE_WIJZIGEN'; transactieIds: string[]; bucket: CategorizedTransaction['bucket'] }
  | { type: 'REGEL_TOEVOEGEN'; regel: UserRule }
  | { type: 'REGEL_TOEPASSEN'; regel: UserRule }
  | { type: 'REGEL_GELEERD'; regel: UserRule }
  | { type: 'REGELS_IMPORTEREN'; userRules: UserRule[]; learnedRules: UserRule[] }
  | { type: 'SELECTIE_WIJZIGEN'; transactieIds: string[] }
  | { type: 'POTJE_TOEVOEGEN'; naam: string; bucket: Exclude<CategorizedTransaction['bucket'], 'ONBEKEND'> }
  | { type: 'POTJE_VERWIJDEREN'; id: string }
  | { type: 'POTJE_HERNOEMEN'; id: string; naam: string }
  | { type: 'NAAR_REVIEW' }
  | { type: 'NAAR_DASHBOARD' }
  | { type: 'NAAR_UPLOAD' }

export const initialState: BankOverzichtState = {
  stap: 'UPLOAD',
  bestanden: [],
  transacties: [],
  userRules: [],
  learnedRules: [],
  potjes: [],
}

// Deduplication key for learned rules
function learnedKey(r: UserRule): string {
  return `${r.tegenpartijPatroon.toLowerCase()}|${r.richting ?? ''}|${r.omschrijvingPatroon ?? ''}`
}

// Derive a learned rule from a corrected transaction
function deriveLearnedRule(tx: CategorizedTransaction, bucket: CategorizedTransaction['bucket']): UserRule {
  return {
    tegenpartijPatroon: tx.tegenpartij.toLowerCase(),
    richting: tx.bedrag < 0 ? 'debit' : tx.bedrag > 0 ? 'credit' : undefined,
    bucket,
    subCategorie: 'overig',
  }
}

// Merge new rules into existing, replacing on same key
function mergeLearnedRules(existing: UserRule[], incoming: UserRule[]): UserRule[] {
  const map = new Map(existing.map((r) => [learnedKey(r), r]))
  for (const r of incoming) map.set(learnedKey(r), r)
  return [...map.values()]
}

// Apply learned rules to ONBEKEND transactions only
function applyLearnedToOnbekend(
  transacties: CategorizedTransaction[],
  learnedRules: UserRule[],
): CategorizedTransaction[] {
  if (learnedRules.length === 0) return transacties
  return transacties.map((tx) => {
    if (tx.bucket !== 'ONBEKEND') return tx
    const re = applyRules([tx], [], learnedRules)
    return re[0]
  })
}

export function bankOverzichtReducer(
  state: BankOverzichtState,
  action: BankOverzichtAction,
): BankOverzichtState {
  switch (action.type) {
    case 'BESTANDEN_TOEVOEGEN':
      return {
        ...state,
        bestanden: [
          ...state.bestanden,
          ...action.bestanden.map((f) => ({
            naam: f.name,
            format: null,
            status: 'PARSING' as const,
          })),
        ],
      }

    case 'BESTAND_PARSED':
      return {
        ...state,
        bestanden: state.bestanden.map((b) =>
          b.naam === action.bestandNaam ? { ...b, status: 'KLAAR' as const } : b,
        ),
        transacties: [...state.transacties, ...action.transacties],
      }

    case 'BESTAND_FOUT':
      return {
        ...state,
        bestanden: state.bestanden.map((b) =>
          b.naam === action.bestandNaam
            ? { ...b, status: 'FOUT' as const, foutmelding: action.foutmelding }
            : b,
        ),
      }

    case 'CATEGORIE_WIJZIGEN': {
      const ids = new Set(action.transactieIds)

      // 1. Update bucket on selected transactions
      const updatedTxs = state.transacties.map((tx) =>
        ids.has(tx.id) ? { ...tx, bucket: action.bucket, isHandmatig: true } : tx,
      )

      // 2. Derive learned rules from corrected transactions
      const corrected = state.transacties.filter((tx) => ids.has(tx.id))
      const newRules = corrected.map((tx) => deriveLearnedRule(tx, action.bucket))

      // 3. Deduplicate into existing learnedRules
      const mergedRules = mergeLearnedRules(state.learnedRules, newRules)

      // 4. Re-scan ONBEKEND transactions with updated learned rules
      const finalTxs = applyLearnedToOnbekend(updatedTxs, mergedRules)

      return { ...state, transacties: finalTxs, learnedRules: mergedRules }
    }

    case 'REGEL_TOEVOEGEN':
      return { ...state, userRules: [...state.userRules, action.regel] }

    case 'REGEL_TOEPASSEN': {
      const lowercased: UserRule = {
        ...action.regel,
        tegenpartijPatroon: action.regel.tegenpartijPatroon.toLowerCase(),
      }
      const pattern = lowercased.tegenpartijPatroon
      return {
        ...state,
        userRules: [...state.userRules, lowercased],
        transacties: state.transacties.map((tx) => {
          if (!tx.tegenpartij.toLowerCase().includes(pattern)) return tx
          if (lowercased.richting === 'debit' && tx.bedrag > 0) return tx
          if (lowercased.richting === 'credit' && tx.bedrag < 0) return tx
          return { ...tx, bucket: lowercased.bucket, isHandmatig: true }
        }),
      }
    }

    case 'REGEL_GELEERD': {
      const merged = mergeLearnedRules(state.learnedRules, [action.regel])
      const finalTxs = applyLearnedToOnbekend(state.transacties, merged)
      return { ...state, learnedRules: merged, transacties: finalTxs }
    }

    case 'REGELS_IMPORTEREN': {
      const finalTxs = state.transacties.length > 0
        ? state.transacties.map((tx) => {
            // Preserve manually-corrected transactions untouched
            if (tx.isHandmatig) return tx
            // Strip categorization fields and re-categorize
            const { bucket: _b, subCategorie: _s, isHandmatig: _h, isDuplicaat, regelNaam: _r, ...parsed } = tx
            const [recategorized] = applyRules([parsed], action.userRules, action.learnedRules)
            return { ...recategorized, isDuplicaat } // preserve duplicate flag
          })
        : state.transacties
      return {
        ...state,
        userRules: action.userRules,
        learnedRules: action.learnedRules,
        transacties: finalTxs,
      }
    }

    case 'SELECTIE_WIJZIGEN':
      return { ...state, geselecteerdeTransacties: action.transactieIds }

    case 'POTJE_TOEVOEGEN':
      return {
        ...state,
        potjes: [...state.potjes, { id: crypto.randomUUID(), naam: action.naam, bucket: action.bucket }],
      }

    case 'POTJE_VERWIJDEREN':
      return { ...state, potjes: state.potjes.filter((p) => p.id !== action.id) }

    case 'POTJE_HERNOEMEN':
      return {
        ...state,
        potjes: state.potjes.map((p) => p.id === action.id ? { ...p, naam: action.naam } : p),
      }

    case 'NAAR_REVIEW':
      return { ...state, stap: 'REVIEW' }

    case 'NAAR_DASHBOARD':
      return { ...state, stap: 'DASHBOARD' }

    case 'NAAR_UPLOAD':
      return { ...state, stap: 'UPLOAD' }

    default:
      return state
  }
}
