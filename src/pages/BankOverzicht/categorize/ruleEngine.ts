import type { ParsedTransaction, CategorizedTransaction, UserRule } from '../types'
import { defaultRules } from './rules'

export function applyRules(
  transactions: ParsedTransaction[],
  userRules: UserRule[],
): CategorizedTransaction[] {
  return transactions.map((tx) => {
    const name = tx.tegenpartij.toLowerCase()

    // User rules first (higher priority)
    const userMatch = userRules.find((r) =>
      name.includes(r.tegenpartijPatroon.toLowerCase()),
    )
    if (userMatch) {
      return {
        ...tx,
        bucket: userMatch.bucket,
        subCategorie: null,
        isHandmatig: false,
        isDuplicaat: false,
        regelNaam: userMatch.tegenpartijPatroon,
      }
    }

    // Default rules
    const defaultMatch = defaultRules.find((r) => name.includes(r.patroon))
    if (defaultMatch) {
      return {
        ...tx,
        bucket: defaultMatch.bucket,
        subCategorie: defaultMatch.subCategorie,
        isHandmatig: false,
        isDuplicaat: false,
        regelNaam: defaultMatch.naam,
      }
    }

    return {
      ...tx,
      bucket: 'ONBEKEND',
      subCategorie: null,
      isHandmatig: false,
      isDuplicaat: false,
      regelNaam: null,
    }
  })
}
