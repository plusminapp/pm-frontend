import type { UserRule } from '../types'

interface ExportedRule {
  tegenpartijPatroon: string
  omschrijvingPatroon: string | null
  richting: 'credit' | 'debit' | null
  bucket: string
  subCategorie: string | null
  bron: 'user' | 'learned'
}

interface RulesFile {
  versie: number
  regels: ExportedRule[]
}

export function buildRulesJson(userRules: UserRule[], learnedRules: UserRule[]): string {
  const toExported = (r: UserRule, bron: 'user' | 'learned'): ExportedRule => ({
    tegenpartijPatroon: r.tegenpartijPatroon,
    omschrijvingPatroon: r.omschrijvingPatroon ?? null,
    richting: r.richting ?? null,
    bucket: r.bucket,
    subCategorie: r.subCategorie ?? null,
    bron,
  })

  const file: RulesFile = {
    versie: 1,
    regels: [
      ...userRules.map((r) => toExported(r, 'user')),
      ...learnedRules.map((r) => toExported(r, 'learned')),
    ],
  }
  return JSON.stringify(file, null, 2)
}

export function exportRules(userRules: UserRule[], learnedRules: UserRule[]): void {
  const json = buildRulesJson(userRules, learnedRules)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bankoverzicht-regels.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importRules(json: string): { userRules: UserRule[]; learnedRules: UserRule[] } {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Ongeldig JSON-bestand.')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('versie' in parsed) ||
    typeof (parsed as Record<string, unknown>).versie !== 'number'
  ) {
    throw new Error('Ongeldig regelbestand: versie ontbreekt.')
  }

  const file = parsed as RulesFile
  if (file.versie > 1) {
    throw new Error(
      'Dit regelbestand is van een nieuwere versie. Update de app om het te kunnen laden.',
    )
  }

  if (!Array.isArray(file.regels)) {
    throw new Error('Ongeldig regelbestand: regels ontbreekt.')
  }

  const userRules: UserRule[] = []
  const learnedRules: UserRule[] = []

  for (const r of file.regels) {
    const rule: UserRule = {
      tegenpartijPatroon: r.tegenpartijPatroon,
      ...(r.omschrijvingPatroon ? { omschrijvingPatroon: r.omschrijvingPatroon } : {}),
      ...(r.richting ? { richting: r.richting } : {}),
      bucket: r.bucket as UserRule['bucket'],
      ...(r.subCategorie ? { subCategorie: r.subCategorie } : {}),
    }
    if (r.bron === 'learned') {
      learnedRules.push(rule)
    } else {
      userRules.push(rule) // default to user for missing bron
    }
  }

  return { userRules, learnedRules }
}
