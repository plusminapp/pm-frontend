import { describe, it, expect } from 'vitest'
import { bankOverzichtReducer, initialState } from '../bankOverzichtReducer'
import type { BankOverzichtState, CategorizedTransaction } from '../types'

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
  it('starts in UPLOAD stap', () => {
    expect(initialState.stap).toBe('UPLOAD')
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

  it('SELECTIE_WIJZIGEN replaces selection', () => {
    const next = bankOverzichtReducer(initialState, {
      type: 'SELECTIE_WIJZIGEN',
      transactieIds: ['tx-1', 'tx-2'],
    })
    expect(next.geselecteerdeTransacties).toEqual(['tx-1', 'tx-2'])
  })

  it('NAAR_REVIEW sets stap to REVIEW', () => {
    const next = bankOverzichtReducer(initialState, { type: 'NAAR_REVIEW' })
    expect(next.stap).toBe('REVIEW')
  })

  it('NAAR_DASHBOARD sets stap to DASHBOARD', () => {
    const next = bankOverzichtReducer(initialState, { type: 'NAAR_DASHBOARD' })
    expect(next.stap).toBe('DASHBOARD')
  })

  it('NAAR_UPLOAD sets stap to UPLOAD', () => {
    const state = { ...initialState, stap: 'DASHBOARD' as const }
    const next = bankOverzichtReducer(state, { type: 'NAAR_UPLOAD' })
    expect(next.stap).toBe('UPLOAD')
  })
})
