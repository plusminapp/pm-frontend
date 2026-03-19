# BankOverzicht Categorization Improvements

**Date:** 2026-03-16
**Status:** Draft
**Scope:** `pm-frontend/src/pages/BankOverzicht/`

## Problem

The current categorization engine has three key weaknesses:

1. **No direction awareness** — Rules match on counterparty name only, ignoring whether a transaction is a credit or debit. This causes misclassification (e.g. "belastingdienst" always maps to INKOMEN, even for tax payments which should be VASTE_LASTEN).
2. **Only matches `tegenpartij`** — The `omschrijving` field is ignored entirely. Many transactions have generic counterparty names ("Betaalautomaat", "iDEAL") but contain the real merchant name in the description.
3. **No learning** — Users manually correct transactions but the system doesn't learn from those corrections. The same counterparty keeps getting miscategorized.

## Solution: Enhanced Rule Engine with Learning

Upgrade the existing rule-based architecture with direction-aware matching, description fallback, and session-based learning from user corrections. Add rules export/import so users can save and restore their personalized rules.

## Conventions

**Sign convention:** `bedrag > 0` means credit (money in), `bedrag < 0` means debit (money out). `bedrag === 0` is treated as directionless and matches any `richting`. This is consistent with `ParsedTransaction.bedrag` ("positive = credit, negative = debit") and the recurrence detector's existing checks.

## Design

### 1. Enhanced Rule Types

Both `Rule` (default rules) and `UserRule` (user/learned rules) need the same matching capabilities. To bridge the naming gap between `Rule.patroon` and `UserRule.tegenpartijPatroon`, the engine uses a `MatchableRule` adapter:

```typescript
// Existing Rule interface — extended with optional fields
export interface Rule {
  patroon: string                // match on tegenpartij (existing)
  omschrijvingPatroon?: string   // match on omschrijving (new)
  richting?: 'credit' | 'debit'  // undefined = match both (new)
  bucket: Bucket
  subCategorie: string
  naam: string
}

// Existing UserRule interface — extended with optional fields
export interface UserRule {
  tegenpartijPatroon: string
  omschrijvingPatroon?: string    // new
  richting?: 'credit' | 'debit'   // new
  bucket: Bucket
  subCategorie?: string           // new
}

// Internal adapter used by the matching engine (not exported to UI)
interface MatchableRule {
  tegenpartijPatroon: string
  omschrijvingPatroon?: string
  richting?: 'credit' | 'debit'
  bucket: Bucket
  subCategorie: string | null
  naam: string | null
}

// Conversion functions in ruleEngine.ts
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
    naam: `${naamPrefix}: ${r.tegenpartijPatroon}`,   // e.g. "geleerd: belastingdienst"
  }
}
```

`fromUser` takes a `naamPrefix` so it can produce `"regel: albert heijn"` for user rules and `"geleerd: belastingdienst"` for learned rules. This `naam` flows into `CategorizedTransaction.regelNaam` for UI transparency. Note: `subCategorie ?? null` converts `undefined` to `null` to match `CategorizedTransaction.subCategorie: string | null`.

Fully backward-compatible: existing rules without `richting` or `omschrijvingPatroon` work exactly as before.

### 2. Enhanced Rule Engine

**Match priority (highest to lowest):**

1. User rules — tegenpartij match (direction-aware)
2. Learned rules — tegenpartij match (direction-aware)
3. Default rules — tegenpartij match (direction-aware)
4. User rules — omschrijving match
5. Learned rules — omschrijving match
6. Default rules — omschrijving match
7. Recurrence detection (existing, unchanged)
8. ONBEKEND

**Within each tier, a direction-specific rule beats a directionless rule.** Example: `belastingdienst + debit -> VASTE_LASTEN` wins over `belastingdienst + any -> INKOMEN`.

**Matching function logic:**

```typescript
function matches(
  rule: MatchableRule,
  tegenpartij: string,
  omschrijving: string,
  bedrag: number,
): { field: 'tegenpartij' | 'omschrijving' } | null
```

- If `tegenpartij` is empty or whitespace-only, skip tegenpartij matching entirely (prevent empty-string substring matches)
- Check `richting`: if rule says `'credit'` but `bedrag < 0`, skip. If `'debit'` but `bedrag > 0`, skip. `bedrag === 0` matches any `richting`.
- Check `tegenpartijPatroon` against `tegenpartij` (case-insensitive substring) — if hit, return `{ field: 'tegenpartij' }`
- For omschrijving matching: only attempt if the rule has an explicit `omschrijvingPatroon`, OR if `tegenpartij` is empty/generic (see below). **Do NOT fall back to testing `tegenpartijPatroon` against `omschrijving` unconditionally** — short patterns like `'ns '`, `'cz '`, `'ret '` would produce false positives in free-text descriptions.
- If `omschrijvingPatroon` is defined: test it against `omschrijving` — if hit, return `{ field: 'omschrijving' }`
- If `omschrijvingPatroon` is NOT defined but `tegenpartij` is generic: test `tegenpartijPatroon` against `omschrijving` as fallback — if hit, return `{ field: 'omschrijving' }`
- Return null if nothing matches

**Generic tegenpartij detection:** A tegenpartij is considered generic if it's empty, whitespace-only, or its lowercased trimmed value exactly equals one of: `['betaalautomaat', 'ideal', 'tikkie', 'pin', 'overschrijving', 'sepa']`. This is an **exact match** against the full tegenpartij value (not a substring), so "Pinpoint Media" would NOT be treated as generic. The list is a constant in the engine, easy to extend.

**Cascade algorithm pseudocode:**

```typescript
export function applyRules(
  transactions: ParsedTransaction[],
  userRules: UserRule[],
  learnedRules: UserRule[] = [],   // default [] for backward compat
): CategorizedTransaction[] {
  // Convert all rule sets to MatchableRule
  const user = userRules.map(r => fromUser(r, 'regel'))
  const learned = learnedRules.map(r => fromUser(r, 'geleerd'))
  const defaults = defaultRules.map(fromDefault)

  // Ordered rule tiers
  const tiers = [user, learned, defaults]

  return transactions.map(tx => {
    const tp = tx.tegenpartij
    const om = tx.omschrijving
    const bed = tx.bedrag

    // Pass 1: tegenpartij matches (tiers 1-3)
    for (const tier of tiers) {
      // Direction-specific rules first within this tier
      const sorted = [...tier].sort((a, b) =>
        (a.richting ? 0 : 1) - (b.richting ? 0 : 1)
      )
      for (const rule of sorted) {
        const m = matches(rule, tp, om, bed)
        if (m?.field === 'tegenpartij') return categorize(tx, rule)
      }
    }

    // Pass 2: omschrijving matches (tiers 4-6)
    for (const tier of tiers) {
      const sorted = [...tier].sort((a, b) =>
        (a.richting ? 0 : 1) - (b.richting ? 0 : 1)
      )
      for (const rule of sorted) {
        const m = matches(rule, tp, om, bed)
        if (m?.field === 'omschrijving') return categorize(tx, rule)
      }
    }

    // No match
    return { ...tx, bucket: 'ONBEKEND', subCategorie: null, isHandmatig: false, isDuplicaat: false, regelNaam: null }
  })
}
```

The two-pass approach (first all tegenpartij matches across all tiers, then all omschrijving matches) ensures a tegenpartij match from default rules always beats an omschrijving match from user rules.

### 3. Learning from Corrections

**Trigger:** Learning is triggered by `CATEGORIE_WIJZIGEN` (both single and bulk corrections). The reducer looks up each corrected transaction by ID from `state.transacties` to get `tegenpartij` and `bedrag`, then derives direction-aware learned rules inline.

`REGEL_TOEPASSEN` does NOT create learned rules — it adds to `userRules` which already has higher priority (tier 1). No duplication needed.

Both single-transaction and bulk corrections via `CATEGORIE_WIJZIGEN` create learned rules. The rationale: if a user corrects even one transaction, they're expressing intent about that counterparty+direction combination.

**Derivation:** For each unique `tegenpartij + direction` combination in the corrected set, create a learned rule:

```typescript
{
  tegenpartijPatroon: 'belastingdienst',  // lowercased tegenpartij
  richting: 'debit',                       // derived: bedrag < 0 → 'debit', bedrag > 0 → 'credit', bedrag === 0 → undefined
  bucket: 'VASTE_LASTEN',                 // user's chosen bucket
  subCategorie: 'overig',                  // default — CorrectionDialog does not currently support subcategory selection
}
```

**Lowercasing is enforced at rule creation time**, not just at match time. This prevents duplicates like "Belastingdienst" and "belastingdienst" coexisting as separate learned rules.

**Auto-apply:** After a learned rule is created, immediately re-scan all ONBEKEND transactions and apply the new rule. Correcting one "Belastingdienst" debit recategorizes all Belastingdienst debits.

**Last-correction-wins:** The deduplication key is `tegenpartijPatroon + richting`. If a user corrects the same counterparty+direction to a different bucket in a later action, the newer rule replaces the older one. This is a conscious design choice — the user's most recent correction is assumed to be the most correct.

**State:**

```typescript
export interface BankOverzichtState {
  // ... existing fields
  learnedRules: UserRule[]   // new — in-memory only, lost on page refresh
}
```

Learned rules are in-memory only and must be exported to survive a page refresh. The export/import feature (sections 4-5) is the persistence mechanism.

**New reducer action types:**

```typescript
// Added to BankOverzichtAction union
| { type: 'REGEL_GELEERD'; regel: UserRule }
| { type: 'REGELS_IMPORTEREN'; userRules: UserRule[]; learnedRules: UserRule[] }
```

`REGELS_IMPORTEREN` receives pre-validated data (validation/parsing happens in `importRules()` in `export/exportRules.ts` before dispatch).

**Reducer behavior:**

- `REGEL_GELEERD` — Adds learned rule to `state.learnedRules`. Deduplication key: `tegenpartijPatroon + richting` (both lowercased/normalized). If a rule with the same key exists, replace it. Then re-categorize matching ONBEKEND transactions.
- `REGELS_IMPORTEREN` — Replaces `state.userRules` with payload `userRules` and `state.learnedRules` with payload `learnedRules`. If transactions exist, re-runs categorization.
- `CATEGORIE_WIJZIGEN` — Existing behavior (update bucket), plus: handles rule derivation and ONBEKEND re-scan **inline within the same reducer case** (a reducer cannot dispatch to itself). The inline logic reuses the same deduplication key as `REGEL_GELEERD`. Steps: (1) update bucket on selected transactions, (2) derive learned rules from the corrected transactions' `tegenpartij` + `bedrag`, lowercasing `tegenpartijPatroon` at creation, (3) deduplicate against existing `learnedRules`, (4) re-scan remaining ONBEKEND transactions against the new rules.
- `REGEL_TOEPASSEN` — Existing behavior (add to userRules + apply), plus: the reducer **lowercases `action.regel.tegenpartijPatroon`** before storing in `userRules`. It does NOT also add to `learnedRules` — since user rules already have higher priority (tier 1 vs tier 2), a duplicate in `learnedRules` would be dead weight and would produce duplicate entries in the export JSON. **Updated to filter by `richting`** when applying to existing transactions: if the rule has `richting: 'debit'`, only recategorize transactions where `bedrag < 0` (and vice versa for credit). Note: the current CorrectionDialog does not set `richting` on the dispatched rule, so `richting` will be `undefined` (match both directions) — this is correct for the "apply to all matching" use case. Direction-aware rules are only auto-derived via `CATEGORIE_WIJZIGEN`.

**Known limitation:** `subCategorie` defaults to `'overig'` for learned rules because the CorrectionDialog does not support subcategory selection. Adding subcategory selection to the dialog is a future enhancement.

### 4. Rules Export

**Location:** New "Regels exporteren" button added to the REVIEW step action bar (next to "Bestanden toevoegen" and "Naar dashboard"). This is a new UI element — the existing `ExportButtons` component on the DASHBOARD step is separate.

**Format:**

```json
{
  "versie": 1,
  "regels": [
    {
      "tegenpartijPatroon": "belastingdienst",
      "omschrijvingPatroon": null,
      "richting": "debit",
      "bucket": "VASTE_LASTEN",
      "subCategorie": "belasting",
      "bron": "learned"
    }
  ]
}
```

Each rule includes all fields: `tegenpartijPatroon`, `omschrijvingPatroon` (null if not set), `richting` (null if not set), `bucket`, `subCategorie` (null if not set), and `bron`. The `bron` field is `"user"` (from manual rule creation / REGEL_TOEPASSEN) or `"learned"` (from correction-derived learning). This preserves the priority distinction on re-import.

Downloaded as `bankoverzicht-regels.json`.

**PDF auto-export:** When the user exports a PDF from the dashboard, the JSON rules file is also automatically triggered as a separate download. **Only if there are user or learned rules** — if both lists are empty, no JSON is downloaded. Note: some browsers may block the second download as a popup; if `document.createElement('a').click()` fails silently, this is acceptable — the user can always manually export from REVIEW.

### 5. Rules Import

**Location:** On the UPLOAD step, below the FileDropZone. Small link/button: "Heb je eerder regels opgeslagen? Importeer ze hier." Also accessible on the REVIEW step.

**Behavior:**

1. Validate JSON structure and `versie` field. **Reject files with `versie` > 1** with error message: "Dit regelbestand is van een nieuwere versie. Update de app om het te kunnen laden." No forward-compatibility attempted.
2. `importRules(json)` in `export/exportRules.ts` validates and returns `{ userRules: UserRule[], learnedRules: UserRule[] }` split by `bron` field. Rules without a `bron` field default to `userRules` (backward compat with hand-edited files).
3. Dispatch `REGELS_IMPORTEREN` action with the pre-validated data.
4. Show confirmation chip: "12 regels geladen"
5. If transactions are already loaded, re-run categorization with the new rules

### 6. Direction-Aware Default Rules

Split ambiguous default rules into credit/debit variants. Example:

```typescript
// Before:
{ patroon: 'belastingdienst', bucket: 'INKOMEN', subCategorie: 'toeslagen', naam: 'belastingdienst' }

// After:
{ patroon: 'belastingdienst', richting: 'credit', bucket: 'INKOMEN', subCategorie: 'toeslagen', naam: 'Belastingdienst toeslag' },
{ patroon: 'belastingdienst', richting: 'debit', bucket: 'VASTE_LASTEN', subCategorie: 'belasting', naam: 'Belastingdienst aanslag' },
```

Other candidates for splitting: `svb` (AOW credit vs premie debit), `gemeente` (toeslag credit vs belasting debit), `nationale nederlanden` (uitkering credit vs premie debit).

Rules that are unambiguously one direction (e.g. `albert heijn` is always a debit) keep `richting: undefined` to stay simple.

## Files to Modify

| File | Changes |
|------|---------|
| `types.ts` | Add `richting`, `omschrijvingPatroon`, `subCategorie` to `UserRule`. Add `learnedRules` to `BankOverzichtState`. |
| `categorize/rules.ts` | Add `omschrijvingPatroon` and `richting` to `Rule` interface. Split ambiguous default rules into direction variants. |
| `categorize/ruleEngine.ts` | `MatchableRule` adapter with `fromDefault`/`fromUser`, `matches()` function, two-pass cascade, generic tegenpartij detection. New signature: `applyRules(txs, userRules, learnedRules = [])`. |
| `bankOverzichtReducer.ts` | Add `learnedRules` to state/initial. Add `REGEL_GELEERD` and `REGELS_IMPORTEREN` to action union with typed payloads. Update `CATEGORIE_WIJZIGEN` to derive learned rules. Update `REGEL_TOEPASSEN` to add to learnedRules and filter by `richting` when applying. |
| `export/exportPdf.ts` | Trigger JSON rules download alongside PDF export (only if rules exist). |
| `components/CorrectionDialog.tsx` | No changes needed — learning is handled in the reducer. |
| `BankOverzicht.tsx` | Import UI on UPLOAD step (new). Export button on REVIEW step action bar (new). Update `handleFiles` to pass `state.learnedRules` to `applyRules`. |

## New Files

| File | Purpose |
|------|---------|
| `export/exportRules.ts` | `exportRules(userRules, learnedRules)` — builds JSON with `bron` tags and triggers download. `importRules(json)` — validates JSON, checks `versie`, rejects unknown versions, returns `{ userRules: UserRule[], learnedRules: UserRule[] }`. |

## Testing

- `ruleEngine.test.ts` — Direction-aware matching, omschrijving fallback (only for generic tegenpartij), two-pass priority cascade, direction-specific beats directionless, learned rules priority, empty tegenpartij handling, zero-amount direction matching, `learnedRules` default parameter backward compat
- `recurrenceDetector.test.ts` — Unchanged (recurrence still runs after rules)
- `exportRules.test.ts` — New: export format with `bron` field, import validation, `versie` rejection for unknown versions, malformed JSON handling, backward compat for missing `bron`, round-trip (export then import preserves rule tiers)
- `bankOverzichtReducer.test.ts` — New cases: `REGEL_GELEERD` (add + dedup by key + auto-apply to ONBEKEND), `REGELS_IMPORTEREN` (split by bron, re-categorize), learning from `CATEGORIE_WIJZIGEN` (reducer lookup), learning from `REGEL_TOEPASSEN` (direction-aware apply), lowercasing enforcement, last-correction-wins behavior

## Backward Compatibility

- All existing rules work unchanged (no `richting` = match both directions, no `omschrijvingPatroon` = tegenpartij-only matching, no description fallback for non-generic counterparties)
- Existing `UserRule` objects without new fields are valid
- Existing tests pass without modification — `learnedRules` parameter defaults to `[]`
- Imported JSON without `bron` field defaults to `userRules`
