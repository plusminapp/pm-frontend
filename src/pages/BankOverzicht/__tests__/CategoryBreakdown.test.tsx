import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryBreakdown } from '../components/CategoryBreakdown'
import type { CategorizedTransaction, UserRule } from '../types'

const tx = (id: string, tegenpartij: string): CategorizedTransaction => ({
  id,
  datum: '2025-01-15',
  bedrag: -12.34,
  omschrijving: 'Abonnement',
  tegenrekening: null,
  tegenpartij,
  bronBestand: 'ing.csv',
  bankFormat: 'ING',
  bucket: 'ONBEKEND',
  potje: null,
  isHandmatig: false,
  regelNaam: null,
  isDuplicaat: false,
})

describe('CategoryBreakdown', () => {
  it('groups transactions together when one tegenpartij has a payment prefix and both match the same Jumbo rule', () => {
    render(
      <CategoryBreakdown
        transacties={[
          { ...tx('t-1', 'BCK*Jumbo Deventer >DEVENTER 2.01.'), bucket: 'LEEFGELD' },
          { ...tx('t-2', 'Jumbo Binnend Twel>TWELLO'), bucket: 'LEEFGELD' },
        ]}
        potjes={[]}
        userRules={[{ tegenpartijPatroon: 'jumbo', bucket: 'LEEFGELD' }]}
        learnedRules={[]}
        onCorrectie={vi.fn()}
        onPotjeToevoegen={vi.fn()}
      />,
    )

    expect(screen.getByText('2×')).toBeInTheDocument()
  })

  it('passes edited group name as groepCriterium when saving from a single row inside a group', () => {
    const onCorrectie = vi.fn()
    const learnedRules: UserRule[] = [
      {
        tegenpartijPatroon: 'Netflix',
        bucket: 'LEEFGELD',
      },
    ]

    render(
      <CategoryBreakdown
        transacties={[
          tx('t-1', 'Netflix Amsterdam'),
          tx('t-2', 'Netflix BV'),
        ]}
        potjes={[]}
        userRules={[]}
        learnedRules={learnedRules}
        onCorrectie={onCorrectie}
        onPotjeToevoegen={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText(/netflix/i))
    fireEvent.click(screen.getByRole('button', { name: /categorie wijzigen voor netflix amsterdam/i }))

    const groepNaamInput = screen.getByLabelText(/groepsnaam/i)
    fireEvent.change(groepNaamInput, { target: { value: 'Netflix Gezinsabonnement' } })
    fireEvent.click(screen.getByRole('button', { name: /opslaan/i }))

    expect(onCorrectie).toHaveBeenCalledWith(
      ['t-1'],
      'LEEFGELD',
      null,
      'Netflix Gezinsabonnement',
    )
  })
})
