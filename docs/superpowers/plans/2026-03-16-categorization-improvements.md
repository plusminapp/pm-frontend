# Categorization Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the BudgetScanner categorization engine with direction-aware rules, omschrijving matching, session-based learning from corrections, and JSON rules export/import.

**Architecture:** The existing `applyRules()` function is replaced with a two-pass cascade engine using a `MatchableRule` adapter to unify `Rule` and `UserRule` matching. Learning is handled inline in the reducer's `CATEGORIE_WIJZIGEN` case. Export/import lives in a new `exportRules.ts` file.

**Tech Stack:** TypeScript, React `useReducer`, Vitest, jsPDF

**Spec:** `docs/superpowers/specs/2026-03-16-categorization-improvements-design.md`

---

## Chunk 1: Types, Rule Interface & Direction-Aware Default Rules

### Task 1: Extend `UserRule` and `BudgetScannerState` types

**Files:**
- Modify: `src/pages/BudgetScanner/types.ts`

- [ ] **Step 1: Update `UserRule` and `BudgetScannerState` in `types.ts`**

Replace the existing `UserRule` and `BudgetScannerState` interfaces:

```typescript
export interface UserRule {
  tegenpartijPatroon: string
  omschrijvingPatroon?: string   // new
  richting?: 'credit' | 'debit' // new
  bucket: Bucket
  subCategorie?: string          // new
}

export interface BudgetScannerState {
  stap: 'UPLOAD' | 'REVIEW' | 'DASHBOARD'
  bestanden: BestandStatus[]
  transacties: CategorizedTransaction[]
  userRules: UserRule[]
  learnedRules: UserRule[]                // new
  geselecteerdeTransacties: string[]
}
```

- [ ] **Step 2: Run the full test suite to confirm no regressions**

```bash
cd /projects/plusmin/pm-frontend && npm run test
```

Expected: all existing tests pass (new fields are optional, no existing tests reference `learnedRules`)

- [ ] **Step 3: Commit**

```bash
git add src/pages/BudgetScanner/types.ts
git commit -m "feat(bank-overzicht): extend UserRule and BudgetScannerState types for direction-aware learning"
```

---

### Task 2: Extend `Rule` interface and add direction-aware default rules

**Files:**
- Modify: `src/pages/BudgetScanner/categorize/rules.ts`

- [ ] **Step 1: Add optional fields to `Rule` interface**

Replace the `Rule` interface at the top of `rules.ts`:

```typescript
export interface Rule {
  patroon: string                // case-insensitive substring match on tegenpartij
  omschrijvingPatroon?: string   // optional match on omschrijving
  richting?: 'credit' | 'debit' // undefined = match both directions
  bucket: Bucket
  subCategorie: string
  naam: string
}
```

- [ ] **Step 2: Split ambiguous default rules into direction-aware variants**

In `defaultRules`, replace the four ambiguous rules with direction-split versions:

```typescript
// Replace:
{ patroon: 'belastingdienst', bucket: 'INKOMEN', subCategorie: 'toeslagen', naam: 'belastingdienst' },

// With:
{ patroon: 'belastingdienst', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'toeslagen',  naam: 'Belastingdienst toeslag' },
{ patroon: 'belastingdienst', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'belasting',  naam: 'Belastingdienst aanslag' },

// Replace:
{ patroon: 'svb', bucket: 'INKOMEN', subCategorie: 'aow', naam: 'SVB' },

// With:
{ patroon: 'svb', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'aow',        naam: 'SVB uitkering' },
{ patroon: 'svb', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'verzekering', naam: 'SVB premie' },

// Replace:
{ patroon: 'gemeente', bucket: 'VASTE_LASTEN', subCategorie: 'gemeentelijk', naam: 'Gemeente' },

// With:
{ patroon: 'gemeente', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'toeslag',     naam: 'Gemeente toeslag' },
{ patroon: 'gemeente', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'gemeentelijk', naam: 'Gemeente belasting' },

// Replace:
{ patroon: 'nationale nederlanden', bucket: 'VASTE_LASTEN', subCategorie: 'verzekering', naam: 'Nationale Nederlanden' },

// With:
{ patroon: 'nationale nederlanden', richting: 'credit', bucket: 'INKOMEN',      subCategorie: 'uitkering',   naam: 'Nationale Nederlanden uitkering' },
{ patroon: 'nationale nederlanden', richting: 'debit',  bucket: 'VASTE_LASTEN', subCategorie: 'verzekering', naam: 'Nationale Nederlanden premie' },
```

- [ ] **Step 3: Run tests**

```bash
cd /projects/plusmin/pm-frontend && npm run test
```

Expected: all existing tests pass (the rule engine still uses `patroon` directly — the new `Rule` fields are optional and ignored until Task 3)

- [ ] **Step 4: Commit**

```bash
git add src/pages/BudgetScanner/categorize/rules.ts
git commit -m "feat(bank-overzicht): add direction-aware default rules for belastingdienst, svb, gemeente, nationale nederlanden"
```

---

## Chunk 2: Enhanced Rule Engine

### Task 3: Rewrite `ruleEngine.ts` with two-pass cascade

**Files:**
- Modify: `src/pages/BudgetScanner/categorize/ruleEngine.ts`
- Modify: `src/pages/BudgetScanner/__tests__/ruleEngine.test.ts`

- [ ] **Step 1: Write new failing tests in `ruleEngine.test.ts`**

Add these test cases to the existing `describe('applyRules', ...)` block:

```typescript
// --- Direction-aware matching ---
it('belastingdienst credit is categorized as INKOMEN', () => {
  const result = applyRules([makeTx({ tegenpartij: 'Belastingdienst', bedrag: 300 })], [])
  expect(result[0].bucket).toBe('INKOMEN')
  expect(result[0].regelNaam).toBe('Belastingdienst toeslag')
})

it('belastingdienst debit is categorized as VASTE_LASTEN', () => {
  const result = applyRules([makeTx({ tegenpartij: 'Belastingdienst', bedrag: -300 })], [])
  expect(result[0].bucket).toBe('VASTE_LASTEN')
  expect(result[0].regelNaam).toBe('Belastingdienst aanslag')
})

it('zero-amount transaction matches directionless rules', () => {
  const result = applyRules([makeTx({ tegenpartij: 'Albert Heijn', bedrag: 0 })], [])
  expect(result[0].bucket).toBe('LEEFGELD')
})

// --- Omschrijving fallback (only for generic tegenpartij) ---
it('matches on omschrijving when tegenpartij is generic', () => {
  const result = applyRules([makeTx({
    tegenpartij: 'Betaalautomaat',
    omschrijving: 'Betaling Albert Heijn filiaal 1234',
    bedrag: -15,
  })], [])
  expect(result[0].bucket).toBe('LEEFGELD')
  expect(result[0].regelNaam).toBe('Albert Heijn')
})

it('does NOT match on omschrijving when tegenpartij is specific', () => {
  const result = applyRules([makeTx({
    tegenpartij: 'Bakker Jan',
    omschrijving: 'Albert Heijn korting',
    bedrag: -15,
  })], [])
  expect(result[0].bucket).toBe('ONBEKEND')
})

it('matches on omschrijving when tegenpartij is empty', () => {
  const result = applyRules([makeTx({
    tegenpartij: '',
    omschrijving: 'Ziggo internet factuur',
    bedrag: -49,
  })], [])
  expect(result[0].bucket).toBe('VASTE_LASTEN')
})

// --- Priority cascade: tegenpartij beats omschrijving ---
it('tegenpartij match from default rules beats omschrijving match from user rules', () => {
  const userRule: UserRule = { tegenpartijPatroon: 'albert heijn', bucket: 'SPAREN', omschrijvingPatroon: 'iets' }
  const result = applyRules([makeTx({
    tegenpartij: 'Jumbo Supermarkt',
    omschrijving: 'iets',
    bedrag: -20,
  })], [userRule])
  // tegenpartij matches default rule for Jumbo (tier 3), not user rule omschrijving (tier 4)
  expect(result[0].bucket).toBe('LEEFGELD')
})

// --- Learned rules priority ---
it('learned rules have higher priority than default rules', () => {
  const learned: UserRule = { tegenpartijPatroon: 'jumbo', bucket: 'SPAREN' }
  const result = applyRules(
    [makeTx({ tegenpartij: 'Jumbo Supermarkt', bedrag: -20 })],
    [],
    [learned],
  )
  expect(result[0].bucket).toBe('SPAREN')
  expect(result[0].regelNaam).toBe('geleerd: jumbo')
})

it('user rules have higher priority than learned rules', () => {
  const userRule: UserRule = { tegenpartijPatroon: 'jumbo', bucket: 'VASTE_LASTEN' }
  const learnedRule: UserRule = { tegenpartijPatroon: 'jumbo', bucket: 'SPAREN' }
  const result = applyRules(
    [makeTx({ tegenpartij: 'Jumbo', bedrag: -20 })],
    [userRule],
    [learnedRule],
  )
  expect(result[0].bucket).toBe('VASTE_LASTEN')
  expect(result[0].regelNaam).toBe('regel: jumbo')
})

// --- Direction-specific beats directionless within same tier ---
it('direction-specific user rule beats directionless user rule for matching direction', () => {
  const directionless: UserRule = { tegenpartijPatroon: 'foo', bucket: 'LEEFGELD' }
  const directional: UserRule = { tegenpartijPatroon: 'foo', richting: 'debit', bucket: 'VASTE_LASTEN' }
  // Both in userRules tier; directional should win for a debit tx
  const result = applyRules([makeTx({ tegenpartij: 'Foo BV', bedrag: -50 })], [directionless, directional])
  expect(result[0].bucket).toBe('VASTE_LASTEN')
})

// --- bedrag === 0 matches direction-specific rules ---
it('bedrag === 0 matches a direction-specific rule', () => {
  // A rule with richting: 'debit' should still match when bedrag is 0 (zero is directionless per spec)
  const rule: UserRule = { tegenpartijPatroon: 'test', richting: 'debit', bucket: 'VASTE_LASTEN' }
  const result = applyRules([makeTx({ tegenpartij: 'Test BV', bedrag: 0 })], [rule])
  expect(result[0].bucket).toBe('VASTE_LASTEN')
})

// --- Backward compat ---
it('learnedRules defaults to empty array (two-arg call still works)', () => {
  const result = applyRules([makeTx({ tegenpartij: 'Albert Heijn' })], [])
  expect(result[0].bucket).toBe('LEEFGELD')
})

// --- regelNaam for user rules ---
it('regelNaam is prefixed for user rules', () => {
  const userRule: UserRule = { tegenpartijPatroon: 'albert heijn', bucket: 'SPAREN' }
  const result = applyRules([makeTx({ tegenpartij: 'Albert Heijn' })], [userRule])
  expect(result[0].regelNaam).toBe('regel: albert heijn')
})
```

- [ ] **Step 2: Run tests to confirm new tests fail**

```bash
cd /projects/plusmin/pm-frontend && npm run test -- ruleEngine
```

Expected: new tests FAIL (old engine doesn't handle direction, omschrijving, learned rules)

- [ ] **Step 3: Replace `ruleEngine.ts` with new implementation**

```typescript
import type { ParsedTransaction, CategorizedTransaction, UserRule } from '../types'
import type { Rule } from './rules'
import { defaultRules } from './rules'

// Internal adapter — bridges Rule (patroon) and UserRule (tegenpartijPatroon) into one shape
interface MatchableRule {
  tegenpartijPatroon: string
  omschrijvingPatroon?: string
  richting?: 'credit' | 'debit'
  bucket: CategorizedTransaction['bucket']
  subCategorie: string | null
  naam: string | null
}

const GENERIC_TEGENPARTIJEN = new Set([
  'betaalautomaat', 'ideal', 'tikkie', 'pin', 'overschrijving', 'sepa',
])

function isGeneric(tegenpartij: string): boolean {
  return tegenpartij.trim() === '' || GENERIC_TEGENPARTIJEN.has(tegenpartij.trim().toLowerCase())
}

function fromDefault(r: Rule): MatchableRule {
  return {
    tegenpartijPatroon: r.patroon,
    omschrijvingPatroon: r.omschrijvingPatroon,
    richting: r.richting,
    bucket: r.bucket,
    subCategorie: r.subCategorie,
    naam: r.naam,
  }
}

function fromUser(r: UserRule, naamPrefix: string): MatchableRule {
  return {
    tegenpartijPatroon: r.tegenpartijPatroon,
    omschrijvingPatroon: r.omschrijvingPatroon,
    richting: r.richting,
    bucket: r.bucket,
    subCategorie: r.subCategorie ?? null,
    naam: `${naamPrefix}: ${r.tegenpartijPatroon}`,
  }
}

function directionMatches(richting: 'credit' | 'debit' | undefined, bedrag: number): boolean {
  if (!richting || bedrag === 0) return true
  if (richting === 'credit') return bedrag > 0
  return bedrag < 0
}

function matches(
  rule: MatchableRule,
  tegenpartij: string,
  omschrijving: string,
  bedrag: number,
): { field: 'tegenpartij' | 'omschrijving' } | null {
  if (!directionMatches(rule.richting, bedrag)) return null

  const tp = tegenpartij.toLowerCase()
  const om = omschrijving.toLowerCase()
  const patroon = rule.tegenpartijPatroon.toLowerCase()

  // Tegenpartij match (skip if empty/whitespace)
  if (tp.trim() !== '' && tp.includes(patroon)) {
    return { field: 'tegenpartij' }
  }

  // Omschrijving match
  if (rule.omschrijvingPatroon) {
    if (om.includes(rule.omschrijvingPatroon.toLowerCase())) {
      return { field: 'omschrijving' }
    }
  } else if (isGeneric(tegenpartij)) {
    // Fallback: use tegenpartijPatroon against omschrijving only for generic counterparties
    if (om.includes(patroon)) {
      return { field: 'omschrijving' }
    }
  }

  return null
}

function categorize(tx: ParsedTransaction, rule: MatchableRule): CategorizedTransaction {
  return {
    ...tx,
    bucket: rule.bucket,
    subCategorie: rule.subCategorie,
    isHandmatig: false,
    isDuplicaat: false,
    regelNaam: rule.naam,
  }
}

function sortBySpecificity(rules: MatchableRule[]): MatchableRule[] {
  // Direction-specific rules before directionless within a tier
  return [...rules].sort((a, b) => (a.richting ? 0 : 1) - (b.richting ? 0 : 1))
}

export function applyRules(
  transactions: ParsedTransaction[],
  userRules: UserRule[],
  learnedRules: UserRule[] = [],
): CategorizedTransaction[] {
  const user = sortBySpecificity(userRules.map((r) => fromUser(r, 'regel')))
  const learned = sortBySpecificity(learnedRules.map((r) => fromUser(r, 'geleerd')))
  const defaults = sortBySpecificity(defaultRules.map(fromDefault))

  const tiers = [user, learned, defaults]

  return transactions.map((tx) => {
    const { tegenpartij, omschrijving, bedrag } = tx

    // Pass 1: tegenpartij matches across all tiers (highest priority)
    for (const tier of tiers) {
      for (const rule of tier) {
        const m = matches(rule, tegenpartij, omschrijving, bedrag)
        if (m?.field === 'tegenpartij') return categorize(tx, rule)
      }
    }

    // Pass 2: omschrijving matches across all tiers
    for (const tier of tiers) {
      for (const rule of tier) {
        const m = matches(rule, tegenpartij, omschrijving, bedrag)
        if (m?.field === 'omschrijving') return categorize(tx, rule)
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
```

- [ ] **Step 4: Run all tests**

```bash
cd /projects/plusmin/pm-frontend && npm run test
```

Expected: all tests pass including the new ones

- [ ] **Step 5: Commit**

```bash
git add src/pages/BudgetScanner/categorize/ruleEngine.ts src/pages/BudgetScanner/__tests__/ruleEngine.test.ts
git commit -m "feat(bank-overzicht): rewrite rule engine with two-pass cascade, direction-awareness, omschrijving fallback"
```

---

## Chunk 3: Reducer — Learning, learnedRules State & New Actions

### Task 4: Update reducer with `learnedRules`, `REGEL_GELEERD`, `REGELS_IMPORTEREN`, and learning from corrections

**Files:**
- Modify: `src/pages/BudgetScanner/budgetScannerReducer.ts`
- Modify: `src/pages/BudgetScanner/__tests__/budgetScannerReducer.test.ts`

- [ ] **Step 1: Write new failing tests in `budgetScannerReducer.test.ts`**

**First, fix an existing test that will break after the reducer rewrite.** The existing test for `REGEL_TOEPASSEN` asserts `tegenpartijPatroon` is stored as-is (e.g. `'Jumbo'`). After the rewrite it will be lowercased. Find and update this assertion in the existing test file:

```typescript
// Find the existing REGEL_TOEPASSEN test that checks tegenpartijPatroon and change:
expect(next.userRules[0].tegenpartijPatroon).toBe('Jumbo')
// To:
expect(next.userRules[0].tegenpartijPatroon).toBe('jumbo')
```

Then add a helper and new describe block at the end of the file:

```typescript
// Helper for learned rule tests
const makeLearnedState = (overrides: Partial<BudgetScannerState> = {}): BudgetScannerState => ({
  ...initialState,
  learnedRules: [],
  ...overrides,
})

describe('learnedRules', () => {
  it('initialState has empty learnedRules', () => {
    expect(initialState.learnedRules).toEqual([])
  })

  it('REGEL_GELEERD adds a learned rule', () => {
    const regel: UserRule = { tegenpartijPatroon: 'test', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const next = budgetScannerReducer(makeLearnedState(), { type: 'REGEL_GELEERD', regel })
    expect(next.learnedRules).toHaveLength(1)
    expect(next.learnedRules[0].tegenpartijPatroon).toBe('test')
  })

  it('REGEL_GELEERD replaces existing rule with same key (last-wins)', () => {
    const existing: UserRule = { tegenpartijPatroon: 'test', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const updated: UserRule = { tegenpartijPatroon: 'test', richting: 'debit', bucket: 'LEEFGELD' }
    const state = makeLearnedState({ learnedRules: [existing] })
    const next = budgetScannerReducer(state, { type: 'REGEL_GELEERD', regel: updated })
    expect(next.learnedRules).toHaveLength(1)
    expect(next.learnedRules[0].bucket).toBe('LEEFGELD')
  })

  it('REGEL_GELEERD auto-applies to ONBEKEND transactions', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'belastingdienst', bedrag: -100, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [tx] })
    const regel: UserRule = { tegenpartijPatroon: 'belastingdienst', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const next = budgetScannerReducer(state, { type: 'REGEL_GELEERD', regel })
    expect(next.transacties[0].bucket).toBe('VASTE_LASTEN')
  })

  it('REGEL_GELEERD does NOT re-categorize already-categorized transactions', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'belastingdienst', bedrag: -100, bucket: 'LEEFGELD' })
    const state = makeLearnedState({ transacties: [tx] })
    const regel: UserRule = { tegenpartijPatroon: 'belastingdienst', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const next = budgetScannerReducer(state, { type: 'REGEL_GELEERD', regel })
    expect(next.transacties[0].bucket).toBe('LEEFGELD') // unchanged
  })

  it('REGELS_IMPORTEREN replaces userRules and learnedRules', () => {
    const userRules: UserRule[] = [{ tegenpartijPatroon: 'test', bucket: 'SPAREN' }]
    const learnedRules: UserRule[] = [{ tegenpartijPatroon: 'foo', richting: 'debit', bucket: 'VASTE_LASTEN' }]
    const next = budgetScannerReducer(makeLearnedState(), {
      type: 'REGELS_IMPORTEREN',
      userRules,
      learnedRules,
    })
    expect(next.userRules).toEqual(userRules)
    expect(next.learnedRules).toEqual(learnedRules)
  })

  it('REGELS_IMPORTEREN re-categorizes existing ONBEKEND transactions with new rules', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'test', bedrag: -50, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [tx] })
    const userRules: UserRule[] = [{ tegenpartijPatroon: 'test', bucket: 'VASTE_LASTEN' }]
    const next = budgetScannerReducer(state, { type: 'REGELS_IMPORTEREN', userRules, learnedRules: [] })
    expect(next.transacties[0].bucket).toBe('VASTE_LASTEN')
  })

  it('REGELS_IMPORTEREN does NOT re-categorize isHandmatig: true transactions', () => {
    const manual = makeTx({ id: 'tx-1', tegenpartij: 'test', bedrag: -50, bucket: 'SPAREN', isHandmatig: true })
    const state = makeLearnedState({ transacties: [manual] })
    const userRules: UserRule[] = [{ tegenpartijPatroon: 'test', bucket: 'VASTE_LASTEN' }]
    const next = budgetScannerReducer(state, { type: 'REGELS_IMPORTEREN', userRules, learnedRules: [] })
    expect(next.transacties[0].bucket).toBe('SPAREN') // manual correction preserved
  })

  it('CATEGORIE_WIJZIGEN derives a learned rule from corrected transactions', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'Belastingdienst', bedrag: -300, bucket: 'INKOMEN' })
    const state = makeLearnedState({ transacties: [tx] })
    const next = budgetScannerReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'VASTE_LASTEN',
    })
    expect(next.learnedRules).toHaveLength(1)
    expect(next.learnedRules[0].tegenpartijPatroon).toBe('belastingdienst') // lowercased
    expect(next.learnedRules[0].richting).toBe('debit')
    expect(next.learnedRules[0].bucket).toBe('VASTE_LASTEN')
  })

  it('CATEGORIE_WIJZIGEN lowercases tegenpartijPatroon in learned rule', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'ZIGGO BV', bedrag: -50, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [tx] })
    const next = budgetScannerReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'VASTE_LASTEN',
    })
    expect(next.learnedRules[0].tegenpartijPatroon).toBe('ziggo bv')
  })

  it('REGEL_TOEPASSEN lowercases tegenpartijPatroon in userRules', () => {
    const next = budgetScannerReducer(makeLearnedState(), {
      type: 'REGEL_TOEPASSEN',
      regel: { tegenpartijPatroon: 'Albert Heijn', bucket: 'SPAREN' },
    })
    expect(next.userRules[0].tegenpartijPatroon).toBe('albert heijn')
  })

  it('REGEL_TOEPASSEN with richting only applies to matching direction', () => {
    const debit = makeTx({ id: 'tx-1', tegenpartij: 'gemeente', bedrag: -50, bucket: 'ONBEKEND' })
    const credit = makeTx({ id: 'tx-2', tegenpartij: 'gemeente', bedrag: 200, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [debit, credit] })
    const next = budgetScannerReducer(state, {
      type: 'REGEL_TOEPASSEN',
      regel: { tegenpartijPatroon: 'gemeente', richting: 'debit', bucket: 'VASTE_LASTEN' },
    })
    expect(next.transacties[0].bucket).toBe('VASTE_LASTEN') // debit → updated
    expect(next.transacties[1].bucket).toBe('ONBEKEND')     // credit → untouched
  })
})
```

- [ ] **Step 2: Run tests to confirm new tests fail**

```bash
cd /projects/plusmin/pm-frontend && npm run test -- budgetScannerReducer
```

Expected: new tests FAIL (TypeScript compile errors because `learnedRules` not yet in `initialState`, and new action types not handled — a compile failure counts as a "fail" here)

- [ ] **Step 3: Update `budgetScannerReducer.ts`**

Replace the full file content:

```typescript
import type {
  BudgetScannerState,
  CategorizedTransaction,
  UserRule,
} from './types'
import { applyRules } from './categorize/ruleEngine'

export type BudgetScannerAction =
  | { type: 'BESTANDEN_TOEVOEGEN'; bestanden: File[] }
  | { type: 'BESTAND_PARSED'; bestandNaam: string; transacties: CategorizedTransaction[] }
  | { type: 'BESTAND_FOUT'; bestandNaam: string; foutmelding: string }
  | { type: 'CATEGORIE_WIJZIGEN'; transactieIds: string[]; bucket: CategorizedTransaction['bucket'] }
  | { type: 'REGEL_TOEVOEGEN'; regel: UserRule }
  | { type: 'REGEL_TOEPASSEN'; regel: UserRule }
  | { type: 'REGEL_GELEERD'; regel: UserRule }
  | { type: 'REGELS_IMPORTEREN'; userRules: UserRule[]; learnedRules: UserRule[] }
  | { type: 'SELECTIE_WIJZIGEN'; transactieIds: string[] }
  | { type: 'NAAR_REVIEW' }
  | { type: 'NAAR_DASHBOARD' }
  | { type: 'NAAR_UPLOAD' }

export const initialState: BudgetScannerState = {
  stap: 'UPLOAD',
  bestanden: [],
  transacties: [],
  userRules: [],
  learnedRules: [],
  geselecteerdeTransacties: [],
}

// Deduplication key for learned rules
function learnedKey(r: UserRule): string {
  return `${r.tegenpartijPatroon.toLowerCase()}|${r.richting ?? ''}`
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

export function budgetScannerReducer(
  state: BudgetScannerState,
  action: BudgetScannerAction,
): BudgetScannerState {
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
          if (lowercased.richting === 'debit' && tx.bedrag >= 0) return tx
          if (lowercased.richting === 'credit' && tx.bedrag <= 0) return tx
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
```

- [ ] **Step 4: Run all tests**

```bash
cd /projects/plusmin/pm-frontend && npm run test
```

Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/pages/BudgetScanner/budgetScannerReducer.ts src/pages/BudgetScanner/__tests__/budgetScannerReducer.test.ts
git commit -m "feat(bank-overzicht): add learnedRules state, REGEL_GELEERD, REGELS_IMPORTEREN, learning from CATEGORIE_WIJZIGEN"
```

---

## Chunk 4: Rules Export/Import + PDF Auto-export

### Task 5: Create `exportRules.ts` and its tests

**Files:**
- Create: `src/pages/BudgetScanner/export/exportRules.ts`
- Create: `src/pages/BudgetScanner/__tests__/exportRules.test.ts`

- [ ] **Step 1: Write tests first**

Create `src/pages/BudgetScanner/__tests__/exportRules.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildRulesJson, importRules } from '../export/exportRules'
import type { UserRule } from '../types'

describe('buildRulesJson', () => {
  it('includes versie: 1', () => {
    const result = JSON.parse(buildRulesJson([], []))
    expect(result.versie).toBe(1)
  })

  it('tags user rules with bron: user', () => {
    const userRule: UserRule = { tegenpartijPatroon: 'albert heijn', bucket: 'LEEFGELD' }
    const result = JSON.parse(buildRulesJson([userRule], []))
    expect(result.regels[0].bron).toBe('user')
  })

  it('tags learned rules with bron: learned', () => {
    const learned: UserRule = { tegenpartijPatroon: 'ziggo', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const result = JSON.parse(buildRulesJson([], [learned]))
    expect(result.regels[0].bron).toBe('learned')
  })

  it('includes all rule fields including null omschrijvingPatroon', () => {
    const rule: UserRule = { tegenpartijPatroon: 'test', bucket: 'SPAREN' }
    const result = JSON.parse(buildRulesJson([rule], []))
    expect(result.regels[0]).toMatchObject({
      tegenpartijPatroon: 'test',
      omschrijvingPatroon: null,
      richting: null,
      bucket: 'SPAREN',
      subCategorie: null,
      bron: 'user',
    })
  })

  it('round-trip: export then import preserves rule tiers', () => {
    const userRules: UserRule[] = [{ tegenpartijPatroon: 'ah', bucket: 'LEEFGELD' }]
    const learnedRules: UserRule[] = [{ tegenpartijPatroon: 'ziggo', richting: 'debit', bucket: 'VASTE_LASTEN' }]
    const json = buildRulesJson(userRules, learnedRules)
    const imported = importRules(json)
    expect(imported.userRules).toHaveLength(1)
    expect(imported.userRules[0].tegenpartijPatroon).toBe('ah')
    expect(imported.learnedRules).toHaveLength(1)
    expect(imported.learnedRules[0].tegenpartijPatroon).toBe('ziggo')
  })
})

describe('importRules', () => {
  it('throws on malformed JSON', () => {
    expect(() => importRules('not json')).toThrow()
  })

  it('throws on versie > 1', () => {
    const json = JSON.stringify({ versie: 2, regels: [] })
    expect(() => importRules(json)).toThrow('nieuwere versie')
  })

  it('throws when versie field is missing', () => {
    const json = JSON.stringify({ regels: [] })
    expect(() => importRules(json)).toThrow()
  })

  it('defaults missing bron to userRules', () => {
    const json = JSON.stringify({
      versie: 1,
      regels: [{ tegenpartijPatroon: 'test', bucket: 'SPAREN' }],
    })
    const result = importRules(json)
    expect(result.userRules).toHaveLength(1)
    expect(result.learnedRules).toHaveLength(0)
  })

  it('splits rules into userRules and learnedRules by bron', () => {
    const json = JSON.stringify({
      versie: 1,
      regels: [
        { tegenpartijPatroon: 'ah', bucket: 'LEEFGELD', bron: 'user' },
        { tegenpartijPatroon: 'ziggo', bucket: 'VASTE_LASTEN', bron: 'learned' },
      ],
    })
    const result = importRules(json)
    expect(result.userRules).toHaveLength(1)
    expect(result.learnedRules).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /projects/plusmin/pm-frontend && npm run test -- exportRules
```

Expected: FAIL — file does not exist yet

- [ ] **Step 3: Create `exportRules.ts`**

```typescript
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
  a.download = 'budgetscanner-regels.json'
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
```

- [ ] **Step 4: Run tests**

```bash
cd /projects/plusmin/pm-frontend && npm run test -- exportRules
```

Expected: all exportRules tests pass

- [ ] **Step 5: Commit**

```bash
git add src/pages/BudgetScanner/export/exportRules.ts src/pages/BudgetScanner/__tests__/exportRules.test.ts
git commit -m "feat(bank-overzicht): add exportRules — JSON rules export/import with bron tagging and versie validation"
```

---

### Task 6: Update `exportPdf.ts` to auto-download rules JSON

**Files:**
- Modify: `src/pages/BudgetScanner/export/exportPdf.ts`

- [ ] **Step 1: Update `exportPdf` signature and add rules auto-download**

Change the function signature and add the auto-download at the end of `exportPdf.ts`:

```typescript
// Change import at top:
import { exportRules } from './exportRules'
import type { UserRule } from '../types'

// Change function signature from:
export function exportPdf(transactions: CategorizedTransaction[], jaar: number): void

// To:
export function exportPdf(
  transactions: CategorizedTransaction[],
  jaar: number,
  userRules: UserRule[] = [],
  learnedRules: UserRule[] = [],
): void
```

At the end of the function body, **after** `doc.save(...)`, add the rules download:

```typescript
  doc.save(`plusmin-jaaroverzicht-${jaar}.pdf`)

  // Auto-download rules JSON alongside PDF (only if any rules exist)
  if (userRules.length > 0 || learnedRules.length > 0) {
    exportRules(userRules, learnedRules)
  }
```

- [ ] **Step 2: Run all tests**

```bash
cd /projects/plusmin/pm-frontend && npm run test
```

Expected: all tests pass (the new parameters default to `[]`)

- [ ] **Step 3: Commit**

```bash
git add src/pages/BudgetScanner/export/exportPdf.ts
git commit -m "feat(bank-overzicht): auto-download rules JSON alongside PDF export when rules exist"
```

---

## Chunk 5: UI Wiring

### Task 7: Wire up `BudgetScanner.tsx` — learnedRules in pipeline, import UI, export button

**Files:**
- Modify: `src/pages/BudgetScanner/BudgetScanner.tsx`
- Modify: `src/pages/BudgetScanner/components/ExportButtons.tsx`

- [ ] **Step 1: Read `ExportButtons.tsx` to understand its current API**

```bash
cat /projects/plusmin/pm-frontend/src/pages/BudgetScanner/components/ExportButtons.tsx
```

- [ ] **Step 2: Update `ExportButtons.tsx` to accept and pass rules to `exportPdf`**

Add `userRules` and `learnedRules` props to `ExportButtons` so it can forward them to `exportPdf`. The component currently calls `exportPdf(transacties, jaar)` — update it to call `exportPdf(transacties, jaar, userRules, learnedRules)`.

The props interface:
```typescript
interface ExportButtonsProps {
  transacties: CategorizedTransaction[]
  jaar: number
  userRules?: UserRule[]      // new, default []
  learnedRules?: UserRule[]   // new, default []
}
```

- [ ] **Step 3: Update `BudgetScanner.tsx`**

Make these three changes in the page component:

**3a. Pass `learnedRules` to `applyRules` in `handleFiles`** (line ~94), and update the `useCallback` dependency array (line ~116):
```typescript
// Change applyRules call:
const categorized = applyRecurrenceDetection(applyRules(parsed, state.userRules))
// To:
const categorized = applyRecurrenceDetection(applyRules(parsed, state.userRules, state.learnedRules))

// Change useCallback dependency array from:
}, [state.userRules, state.transacties])
// To:
}, [state.userRules, state.learnedRules, state.transacties])
```

**3b. Add imports and a `regelsImportStatus` state variable** at the top of the component:
```typescript
// Single combined import from exportRules (do NOT split into two import statements):
import { importRules, exportRules } from './export/exportRules'
import { Download } from 'lucide-react'

// Inside the BudgetScanner component, add state for import confirmation:
const [regelsImportStatus, setRegelsImportStatus] = useState<string | null>(null)
```

**3c. Add rules import UI to the UPLOAD step** (below the `<FileDropZone>` component):
```typescript
// In UPLOAD step JSX, after <FileDropZone .../>:
{regelsImportStatus && (
  <Chip label={regelsImportStatus} color="success" size="small" className="mt-2" />
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
            const { userRules, learnedRules } = importRules(ev.target?.result as string)
            dispatch({ type: 'REGELS_IMPORTEREN', userRules, learnedRules })
            setRegelsImportStatus(`${userRules.length + learnedRules.length} regels geladen`)
          } catch (err) {
            alert(String(err))
          }
        }
        reader.readAsText(file)
        e.target.value = '' // reset so same file can be re-imported
      }}
    />
  </label>
</div>
```

**3d. Add "Regels exporteren" button to REVIEW step action bar** (in REVIEW step JSX, after the "Bestanden toevoegen" Button):

```typescript
<Button
  variant="outlined"
  size="small"
  startIcon={<Download className="h-4 w-4" />}
  onClick={() => exportRules(state.userRules, state.learnedRules)}
  disabled={state.userRules.length === 0 && state.learnedRules.length === 0}
>
  Regels exporteren
</Button>
```

**3e. Pass rules to `ExportButtons` in DASHBOARD step**:
```typescript
// Change:
<ExportButtons transacties={jaarFiltered} jaar={jaar} />
// To:
<ExportButtons
  transacties={jaarFiltered}
  jaar={jaar}
  userRules={state.userRules}
  learnedRules={state.learnedRules}
/>
```

- [ ] **Step 4: Check TypeScript compiles**

```bash
cd /projects/plusmin/pm-frontend && npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 5: Run all tests**

```bash
cd /projects/plusmin/pm-frontend && npm run test
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/pages/BudgetScanner/BudgetScanner.tsx src/pages/BudgetScanner/components/ExportButtons.tsx
git commit -m "feat(bank-overzicht): wire learnedRules into pipeline, add rules import UI and export button"
```

---

## Final Check

- [ ] **Run full test suite one last time**

```bash
cd /projects/plusmin/pm-frontend && npm run test
```

Expected: all tests pass, 0 failures

- [ ] **Run TypeScript check**

```bash
cd /projects/plusmin/pm-frontend && npx tsc --noEmit
```

Expected: 0 errors
