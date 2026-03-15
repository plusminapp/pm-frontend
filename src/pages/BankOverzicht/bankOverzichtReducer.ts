import type {
  BankOverzichtState,
  CategorizedTransaction,
  UserRule,
} from './types'

export type BankOverzichtAction =
  | { type: 'BESTANDEN_TOEVOEGEN'; bestanden: File[] }
  | { type: 'BESTAND_PARSED'; bestandNaam: string; transacties: CategorizedTransaction[] }
  | { type: 'BESTAND_FOUT'; bestandNaam: string; foutmelding: string }
  | { type: 'CATEGORIE_WIJZIGEN'; transactieIds: string[]; bucket: CategorizedTransaction['bucket'] }
  | { type: 'REGEL_TOEVOEGEN'; regel: UserRule }
  | { type: 'REGEL_TOEPASSEN'; regel: UserRule }
  | { type: 'SELECTIE_WIJZIGEN'; transactieIds: string[] }
  | { type: 'NAAR_REVIEW' }
  | { type: 'NAAR_DASHBOARD' }
  | { type: 'NAAR_UPLOAD' }

export const initialState: BankOverzichtState = {
  stap: 'UPLOAD',
  bestanden: [],
  transacties: [],
  userRules: [],
  geselecteerdeTransacties: [],
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
      return {
        ...state,
        transacties: state.transacties.map((tx) =>
          ids.has(tx.id) ? { ...tx, bucket: action.bucket, isHandmatig: true } : tx,
        ),
      }
    }

    case 'REGEL_TOEVOEGEN':
      return { ...state, userRules: [...state.userRules, action.regel] }

    case 'REGEL_TOEPASSEN': {
      const pattern = action.regel.tegenpartijPatroon.toLowerCase()
      return {
        ...state,
        userRules: [...state.userRules, action.regel],
        transacties: state.transacties.map((tx) =>
          tx.tegenpartij.toLowerCase().includes(pattern)
            ? { ...tx, bucket: action.regel.bucket, isHandmatig: true }
            : tx,
        ),
      }
    }

    case 'SELECTIE_WIJZIGEN':
      return { ...state, geselecteerdeTransacties: action.transactieIds }

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
