import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionTable } from '../components/TransactionTable'
import type { CategorizedTransaction } from '../types'

const tx = (id: string, tegenpartij: string, bucket: CategorizedTransaction['bucket'] = 'LEEFGELD'): CategorizedTransaction => ({
  id,
  datum: '2023-06-15',
  bedrag: -25.00,
  omschrijving: 'Test omschrijving',
  tegenrekening: null,
  tegenpartij,
  bronBestand: 'test.csv',
  bankFormat: 'ING',
  bucket,
  subCategorie: null,
  isHandmatig: false,
  isDuplicaat: false,
  regelNaam: null,
})

describe('TransactionTable', () => {
  it('renders all transactions', () => {
    render(
      <TransactionTable
        transacties={[tx('1', 'Albert Heijn'), tx('2', 'Jumbo')]}
        geselecteerd={[]}
        onSelectie={vi.fn()}
      />,
    )
    expect(screen.getByText('Albert Heijn')).toBeInTheDocument()
    expect(screen.getByText('Jumbo')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', () => {
    render(
      <TransactionTable transacties={[]} geselecteerd={[]} onSelectie={vi.fn()} />,
    )
    expect(screen.getByText(/geen transacties/i)).toBeInTheDocument()
  })

  it('calls onSelectie when a row checkbox is toggled', () => {
    const onSelectie = vi.fn()
    render(
      <TransactionTable
        transacties={[tx('1', 'Albert Heijn')]}
        geselecteerd={[]}
        onSelectie={onSelectie}
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: /selecteer Albert Heijn/i })
    fireEvent.click(checkbox)
    expect(onSelectie).toHaveBeenCalledWith(['1'])
  })

  it('deselects a transaction when already selected', () => {
    const onSelectie = vi.fn()
    render(
      <TransactionTable
        transacties={[tx('1', 'Albert Heijn')]}
        geselecteerd={['1']}
        onSelectie={onSelectie}
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: /selecteer Albert Heijn/i })
    fireEvent.click(checkbox)
    expect(onSelectie).toHaveBeenCalledWith([])
  })

  it('selects all via header checkbox', () => {
    const onSelectie = vi.fn()
    render(
      <TransactionTable
        transacties={[tx('1', 'Albert Heijn'), tx('2', 'Jumbo')]}
        geselecteerd={[]}
        onSelectie={onSelectie}
      />,
    )
    const selectAll = screen.getByRole('checkbox', { name: /alles selecteren/i })
    fireEvent.click(selectAll)
    expect(onSelectie).toHaveBeenCalledWith(['1', '2'])
  })
})
