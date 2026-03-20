import { describe, it, expect } from 'vitest'
import { bankOverzichtReducer, initialState } from '../bankOverzichtReducer'
import type { BankOverzichtState, CategorizedTransaction, UserRule } from '../types'

const makeTx = (overrides: Partial<CategorizedTransaction> = {}): CategorizedTransaction => ({
  id: 'tx-1',
  datum: '2023-06-15',
  bedrag: -25.00,
  omschrijving: 'test',
  tegenrekening: null,
  tegenpartij: 'Albert Heijn',
  bronBestand: 'ing.csv',
  bankFormat: 'ING',
  bucket: 'ONBEKEND',
  subCategorie: null,
  isHandmatig: false,
  regelNaam: null,
  isDuplicaat: false,
  ...overrides,
})

describe('bankOverzichtReducer', () => {
  it('starts in WELKOM stap', () => {
    expect(initialState.stap).toBe('WELKOM')
  })

  it('BESTANDEN_TOEVOEGEN adds files with PARSING status', () => {
    const file = { name: 'ing.csv' } as File
    const next = bankOverzichtReducer(initialState, {
      type: 'BESTANDEN_TOEVOEGEN',
      bestanden: [file],
    })
    expect(next.bestanden).toHaveLength(1)
    expect(next.bestanden[0]).toEqual({ naam: 'ing.csv', format: null, status: 'PARSING' })
  })

  it('BESTAND_PARSED sets file to KLAAR and appends transactions', () => {
    const state: BankOverzichtState = {
      ...initialState,
      bestanden: [{ naam: 'ing.csv', format: 'ING', status: 'PARSING' }],
    }
    const tx = makeTx()
    const next = bankOverzichtReducer(state, {
      type: 'BESTAND_PARSED',
      bestandNaam: 'ing.csv',
      transacties: [tx],
    })
    expect(next.bestanden[0].status).toBe('KLAAR')
    expect(next.transacties).toHaveLength(1)
    expect(next.transacties[0].id).toBe('tx-1')
  })

  it('BESTAND_FOUT sets file to FOUT with error message', () => {
    const state: BankOverzichtState = {
      ...initialState,
      bestanden: [{ naam: 'bad.csv', format: null, status: 'PARSING' }],
    }
    const next = bankOverzichtReducer(state, {
      type: 'BESTAND_FOUT',
      bestandNaam: 'bad.csv',
      foutmelding: 'Onbekend formaat',
    })
    expect(next.bestanden[0].status).toBe('FOUT')
    expect(next.bestanden[0].foutmelding).toBe('Onbekend formaat')
  })

  it('CATEGORIE_WIJZIGEN updates bucket and marks as handmatig', () => {
    const state: BankOverzichtState = {
      ...initialState,
      transacties: [makeTx({ id: 'tx-1', bucket: 'ONBEKEND' })],
    }
    const next = bankOverzichtReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'LEEFGELD',
      subCategorie: null,
    })
    expect(next.transacties[0].bucket).toBe('LEEFGELD')
    expect(next.transacties[0].isHandmatig).toBe(true)
  })

  it('REGEL_TOEVOEGEN appends a user rule', () => {
    const next = bankOverzichtReducer(initialState, {
      type: 'REGEL_TOEVOEGEN',
      regel: { tegenpartijPatroon: 'Jumbo', bucket: 'LEEFGELD' },
    })
    expect(next.userRules).toHaveLength(1)
    expect(next.userRules[0].tegenpartijPatroon).toBe('Jumbo')
  })

  it('REGEL_TOEPASSEN adds rule and re-categorizes matching transactions', () => {
    const state: BankOverzichtState = {
      ...initialState,
      transacties: [
        makeTx({ id: 'tx-1', tegenpartij: 'Jumbo Supermarkt', bucket: 'ONBEKEND' }),
        makeTx({ id: 'tx-2', tegenpartij: 'NS Reizigers', bucket: 'ONBEKEND' }),
      ],
    }
    const next = bankOverzichtReducer(state, {
      type: 'REGEL_TOEPASSEN',
      regel: { tegenpartijPatroon: 'Jumbo', bucket: 'LEEFGELD' },
    })
    expect(next.userRules).toHaveLength(1)
    expect(next.transacties[0].bucket).toBe('LEEFGELD')
    expect(next.transacties[0].isHandmatig).toBe(true)
    expect(next.transacties[1].bucket).toBe('ONBEKEND') // no match
  })

  it('NAAR_KOPPELEN sets stap to KOPPELEN', () => {
    const next = bankOverzichtReducer(initialState, { type: 'NAAR_KOPPELEN' })
    expect(next.stap).toBe('KOPPELEN')
  })

  it('NAAR_UPLOAD sets stap to UPLOAD', () => {
    const state = { ...initialState, stap: 'KOPPELEN' as const }
    const next = bankOverzichtReducer(state, { type: 'NAAR_UPLOAD' })
    expect(next.stap).toBe('UPLOAD')
  })
})

// Helper for learned rule tests
const makeLearnedState = (overrides: Partial<BankOverzichtState> = {}): BankOverzichtState => ({
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
    const next = bankOverzichtReducer(makeLearnedState(), { type: 'REGEL_GELEERD', regel })
    expect(next.learnedRules).toHaveLength(1)
    expect(next.learnedRules[0].tegenpartijPatroon).toBe('test')
  })

  it('REGEL_GELEERD replaces existing rule with same key (last-wins)', () => {
    const existing: UserRule = { tegenpartijPatroon: 'test', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const updated: UserRule = { tegenpartijPatroon: 'test', richting: 'debit', bucket: 'LEEFGELD' }
    const state = makeLearnedState({ learnedRules: [existing] })
    const next = bankOverzichtReducer(state, { type: 'REGEL_GELEERD', regel: updated })
    expect(next.learnedRules).toHaveLength(1)
    expect(next.learnedRules[0].bucket).toBe('LEEFGELD')
  })

  it('REGEL_GELEERD auto-applies to ONBEKEND transactions', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'belastingdienst', bedrag: -100, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [tx] })
    const regel: UserRule = { tegenpartijPatroon: 'belastingdienst', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const next = bankOverzichtReducer(state, { type: 'REGEL_GELEERD', regel })
    expect(next.transacties[0].bucket).toBe('VASTE_LASTEN')
  })

  it('REGEL_GELEERD does NOT re-categorize already-categorized transactions', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'belastingdienst', bedrag: -100, bucket: 'LEEFGELD' })
    const state = makeLearnedState({ transacties: [tx] })
    const regel: UserRule = { tegenpartijPatroon: 'belastingdienst', richting: 'debit', bucket: 'VASTE_LASTEN' }
    const next = bankOverzichtReducer(state, { type: 'REGEL_GELEERD', regel })
    expect(next.transacties[0].bucket).toBe('LEEFGELD') // unchanged
  })

  it('REGELS_IMPORTEREN replaces userRules and learnedRules', () => {
    const userRules: UserRule[] = [{ tegenpartijPatroon: 'test', bucket: 'SPAREN' }]
    const learnedRules: UserRule[] = [{ tegenpartijPatroon: 'foo', richting: 'debit', bucket: 'VASTE_LASTEN' }]
    const next = bankOverzichtReducer(makeLearnedState(), {
      type: 'REGELS_IMPORTEREN',
      userRules,
      learnedRules,
      potjes: [],
    })
    expect(next.userRules).toEqual(userRules)
    expect(next.learnedRules).toEqual(learnedRules)
  })

  it('REGELS_IMPORTEREN re-categorizes existing ONBEKEND transactions with new rules', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'test', bedrag: -50, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [tx] })
    const userRules: UserRule[] = [{ tegenpartijPatroon: 'test', bucket: 'VASTE_LASTEN' }]
    const next = bankOverzichtReducer(state, { type: 'REGELS_IMPORTEREN', userRules, learnedRules: [], potjes: [] })
    expect(next.transacties[0].bucket).toBe('VASTE_LASTEN')
  })

  it('REGELS_IMPORTEREN does NOT re-categorize isHandmatig: true transactions', () => {
    const manual = makeTx({ id: 'tx-1', tegenpartij: 'test', bedrag: -50, bucket: 'SPAREN', isHandmatig: true })
    const state = makeLearnedState({ transacties: [manual] })
    const userRules: UserRule[] = [{ tegenpartijPatroon: 'test', bucket: 'VASTE_LASTEN' }]
    const next = bankOverzichtReducer(state, { type: 'REGELS_IMPORTEREN', userRules, learnedRules: [], potjes: [] })
    expect(next.transacties[0].bucket).toBe('SPAREN') // manual correction preserved
  })

  it('CATEGORIE_WIJZIGEN derives a learned rule from corrected transactions', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'Belastingdienst', bedrag: -300, bucket: 'INKOMEN' })
    const state = makeLearnedState({ transacties: [tx] })
    const next = bankOverzichtReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'VASTE_LASTEN',
      subCategorie: null,
    })
    expect(next.learnedRules).toHaveLength(1)
    expect(next.learnedRules[0].tegenpartijPatroon).toBe('belastingdienst') // lowercased
    expect(next.learnedRules[0].richting).toBe('debit')
    expect(next.learnedRules[0].bucket).toBe('VASTE_LASTEN')
  })

  it('CATEGORIE_WIJZIGEN lowercases tegenpartijPatroon in learned rule', () => {
    const tx = makeTx({ id: 'tx-1', tegenpartij: 'ZIGGO BV', bedrag: -50, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [tx] })
    const next = bankOverzichtReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'VASTE_LASTEN',
      subCategorie: null,
    })
    expect(next.learnedRules[0].tegenpartijPatroon).toBe('ziggo bv')
  })

  it('REGEL_TOEPASSEN lowercases tegenpartijPatroon in userRules', () => {
    const next = bankOverzichtReducer(makeLearnedState(), {
      type: 'REGEL_TOEPASSEN',
      regel: { tegenpartijPatroon: 'Albert Heijn', bucket: 'SPAREN' },
    })
    expect(next.userRules[0].tegenpartijPatroon).toBe('albert heijn')
  })

  it('REGEL_TOEPASSEN with richting only applies to matching direction', () => {
    const debit = makeTx({ id: 'tx-1', tegenpartij: 'gemeente', bedrag: -50, bucket: 'ONBEKEND' })
    const credit = makeTx({ id: 'tx-2', tegenpartij: 'gemeente', bedrag: 200, bucket: 'ONBEKEND' })
    const state = makeLearnedState({ transacties: [debit, credit] })
    const next = bankOverzichtReducer(state, {
      type: 'REGEL_TOEPASSEN',
      regel: { tegenpartijPatroon: 'gemeente', richting: 'debit', bucket: 'VASTE_LASTEN' },
    })
    expect(next.transacties[0].bucket).toBe('VASTE_LASTEN') // debit → updated
    expect(next.transacties[1].bucket).toBe('ONBEKEND')     // credit → untouched
  })
})

describe('potje actions', () => {
  it('POTJE_TOEVOEGEN adds a potje with generated id', () => {
    const next = bankOverzichtReducer(initialState, {
      type: 'POTJE_TOEVOEGEN',
      naam: 'Huur',
      bucket: 'VASTE_LASTEN',
    })
    expect(next.potjes).toHaveLength(1)
    expect(next.potjes[0].naam).toBe('Huur')
    expect(next.potjes[0].bucket).toBe('VASTE_LASTEN')
    expect(typeof next.potjes[0].id).toBe('string')
  })

  it('POTJE_VERWIJDEREN removes the matching potje', () => {
    const state = bankOverzichtReducer(initialState, {
      type: 'POTJE_TOEVOEGEN', naam: 'Huur', bucket: 'VASTE_LASTEN',
    })
    const id = state.potjes[0].id
    const next = bankOverzichtReducer(state, { type: 'POTJE_VERWIJDEREN', id })
    expect(next.potjes).toHaveLength(0)
  })

  it('POTJE_VERWIJDEREN leaves other potjes untouched', () => {
    let state = bankOverzichtReducer(initialState, {
      type: 'POTJE_TOEVOEGEN', naam: 'Huur', bucket: 'VASTE_LASTEN',
    })
    state = bankOverzichtReducer(state, {
      type: 'POTJE_TOEVOEGEN', naam: 'Boodschappen', bucket: 'LEEFGELD',
    })
    const idToRemove = state.potjes[0].id
    const next = bankOverzichtReducer(state, { type: 'POTJE_VERWIJDEREN', id: idToRemove })
    expect(next.potjes).toHaveLength(1)
    expect(next.potjes[0].naam).toBe('Boodschappen')
  })

  it('POTJE_HERNOEMEN updates the naam of a potje', () => {
    const state = bankOverzichtReducer(initialState, {
      type: 'POTJE_TOEVOEGEN', naam: 'Huur', bucket: 'VASTE_LASTEN',
    })
    const id = state.potjes[0].id
    const next = bankOverzichtReducer(state, { type: 'POTJE_HERNOEMEN', id, naam: 'Hypotheek' })
    expect(next.potjes[0].naam).toBe('Hypotheek')
    expect(next.potjes[0].bucket).toBe('VASTE_LASTEN')
  })

  it('initialState has empty potjes array', () => {
    expect(initialState.potjes).toEqual([])
  })
})

describe('CATEGORIE_WIJZIGEN with subCategorie', () => {
  it('writes subCategorie onto updated transactions', () => {
    const state: BankOverzichtState = { ...initialState, transacties: [makeTx()] }
    const next = bankOverzichtReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'LEEFGELD',
      subCategorie: 'Boodschappen',
    })
    expect(next.transacties[0].subCategorie).toBe('Boodschappen')
    expect(next.transacties[0].bucket).toBe('LEEFGELD')
    expect(next.transacties[0].isHandmatig).toBe(true)
  })

  it('writes null subCategorie when passed null', () => {
    const state: BankOverzichtState = {
      ...initialState,
      transacties: [makeTx({ subCategorie: 'Huur' })],
    }
    const next = bankOverzichtReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'VASTE_LASTEN',
      subCategorie: null,
    })
    expect(next.transacties[0].subCategorie).toBeNull()
  })

  it('derives learned rule with user-chosen subCategorie, not hardcoded overig', () => {
    const state: BankOverzichtState = { ...initialState, transacties: [makeTx()] }
    const next = bankOverzichtReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'LEEFGELD',
      subCategorie: 'Boodschappen',
    })
    expect(next.learnedRules[0].subCategorie).toBe('Boodschappen')
  })

  it('derives learned rule without subCategorie when null passed', () => {
    const state: BankOverzichtState = { ...initialState, transacties: [makeTx()] }
    const next = bankOverzichtReducer(state, {
      type: 'CATEGORIE_WIJZIGEN',
      transactieIds: ['tx-1'],
      bucket: 'LEEFGELD',
      subCategorie: null,
    })
    expect(next.learnedRules[0].subCategorie).toBeUndefined()
  })
})

describe('REGEL_TOEPASSEN with subCategorie', () => {
  it('writes subCategorie onto matched transactions', () => {
    const state: BankOverzichtState = {
      ...initialState,
      transacties: [makeTx({ tegenpartij: 'Albert Heijn', bucket: 'ONBEKEND' })],
    }
    const next = bankOverzichtReducer(state, {
      type: 'REGEL_TOEPASSEN',
      regel: { tegenpartijPatroon: 'albert heijn', bucket: 'LEEFGELD', subCategorie: 'Boodschappen' },
    })
    expect(next.transacties[0].subCategorie).toBe('Boodschappen')
  })

  it('writes null subCategorie when rule has none', () => {
    const state: BankOverzichtState = {
      ...initialState,
      transacties: [makeTx({ tegenpartij: 'Albert Heijn', subCategorie: 'OldPotje' })],
    }
    const next = bankOverzichtReducer(state, {
      type: 'REGEL_TOEPASSEN',
      regel: { tegenpartijPatroon: 'albert heijn', bucket: 'LEEFGELD' },
    })
    expect(next.transacties[0].subCategorie).toBeNull()
  })
})

describe('REGELS_IMPORTEREN with potjes', () => {
  it('sets state.potjes from action payload', () => {
    const potje = { id: 'p-1', naam: 'Huur', bucket: 'VASTE_LASTEN' as const }
    const next = bankOverzichtReducer(initialState, {
      type: 'REGELS_IMPORTEREN',
      userRules: [],
      learnedRules: [],
      potjes: [potje],
    })
    expect(next.potjes).toEqual([potje])
  })
})
