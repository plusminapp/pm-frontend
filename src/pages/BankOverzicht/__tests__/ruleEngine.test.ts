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
})
