import { describe, it, expect } from 'vitest'
import { applyRules } from '../categorize/ruleEngine'
import type { ParsedTransaction, UserRule } from '../types'

const makeTx = (overrides: Partial<ParsedTransaction> = {}): ParsedTransaction => ({
  id: 'tx-1',
  datum: '2023-06-15',
  bedrag: -25.00,
  omschrijving: '',
  tegenrekening: null,
  tegenpartij: 'Unknown Party',
  bronBestand: 'test.csv',
  bankFormat: 'ING',
  ...overrides,
})

describe('applyRules', () => {
  it('categorizes Albert Heijn as LEEFGELD/boodschappen', () => {
    const result = applyRules([makeTx({ tegenpartij: 'Albert Heijn' })], [])
    expect(result[0].bucket).toBe('LEEFGELD')
    expect(result[0].subCategorie).toBe('boodschappen')
  })

  it('categorizes Ziggo as VASTE_LASTEN/internet', () => {
    const result = applyRules([makeTx({ tegenpartij: 'Ziggo BV' })], [])
    expect(result[0].bucket).toBe('VASTE_LASTEN')
    expect(result[0].subCategorie).toBe('internet')
  })

  it('leaves unmatched transactions as ONBEKEND', () => {
    const result = applyRules([makeTx({ tegenpartij: 'Onbekende Partij BV' })], [])
    expect(result[0].bucket).toBe('ONBEKEND')
    expect(result[0].regelNaam).toBeNull()
  })

  it('user rules take priority over default rules', () => {
    const userRule: UserRule = { tegenpartijPatroon: 'Albert Heijn', bucket: 'SPAREN' }
    const result = applyRules([makeTx({ tegenpartij: 'Albert Heijn' })], [userRule])
    expect(result[0].bucket).toBe('SPAREN')
    expect(result[0].isHandmatig).toBe(false) // rule-matched, not manually corrected
  })

  it('matching is case-insensitive', () => {
    const result = applyRules([makeTx({ tegenpartij: 'ALBERT HEIJN 1234' })], [])
    expect(result[0].bucket).toBe('LEEFGELD')
  })

  it('sets regelNaam for matched transactions', () => {
    const result = applyRules([makeTx({ tegenpartij: 'Jumbo Supermarkt' })], [])
    expect(result[0].regelNaam).toBe('Jumbo')
  })

  it('sets isHandmatig to false for rule-matched transactions', () => {
    const result = applyRules([makeTx({ tegenpartij: 'Jumbo Supermarkt' })], [])
    expect(result[0].isHandmatig).toBe(false)
  })

  it('processes multiple transactions independently', () => {
    const txs = [
      makeTx({ id: 'tx-1', tegenpartij: 'Albert Heijn' }),
      makeTx({ id: 'tx-2', tegenpartij: 'Ziggo' }),
      makeTx({ id: 'tx-3', tegenpartij: 'Onbekend' }),
    ]
    const result = applyRules(txs, [])
    expect(result[0].bucket).toBe('LEEFGELD')
    expect(result[1].bucket).toBe('VASTE_LASTEN')
    expect(result[2].bucket).toBe('ONBEKEND')
  })
})
