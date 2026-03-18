import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PotjesBeheerDialog } from '../components/PotjesBeheerDialog'
import type { Potje } from '../types'

const potjes: Potje[] = [
  { id: 'p-1', naam: 'Huur', bucket: 'VASTE_LASTEN' },
  { id: 'p-2', naam: 'Boodschappen', bucket: 'LEEFGELD' },
]

describe('PotjesBeheerDialog', () => {
  it('renders bucket group headers', () => {
    render(
      <PotjesBeheerDialog open potjes={[]} onSluiten={vi.fn()}
        onToevoegen={vi.fn()} onVerwijderen={vi.fn()} onHernoemen={vi.fn()} />,
    )
    expect(screen.getByText(/inkomsten/i)).toBeInTheDocument()
    expect(screen.getByText(/leefgeld/i)).toBeInTheDocument()
    expect(screen.getByText(/vaste lasten/i)).toBeInTheDocument()
    expect(screen.getByText(/sparen/i)).toBeInTheDocument()
  })

  it('renders existing potjes under correct bucket group', () => {
    render(
      <PotjesBeheerDialog open potjes={potjes} onSluiten={vi.fn()}
        onToevoegen={vi.fn()} onVerwijderen={vi.fn()} onHernoemen={vi.fn()} />,
    )
    expect(screen.getByText('Huur')).toBeInTheDocument()
    expect(screen.getByText('Boodschappen')).toBeInTheDocument()
  })

  it('calls onVerwijderen when delete button is clicked', () => {
    const onVerwijderen = vi.fn()
    render(
      <PotjesBeheerDialog open potjes={potjes} onSluiten={vi.fn()}
        onToevoegen={vi.fn()} onVerwijderen={onVerwijderen} onHernoemen={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /verwijder Huur/i }))
    expect(onVerwijderen).toHaveBeenCalledWith('p-1')
  })

  it('calls onToevoegen when a new potje is submitted', () => {
    const onToevoegen = vi.fn()
    render(
      <PotjesBeheerDialog open potjes={[]} onSluiten={vi.fn()}
        onToevoegen={onToevoegen} onVerwijderen={vi.fn()} onHernoemen={vi.fn()} />,
    )
    // Open the new-potje form for LEEFGELD
    fireEvent.click(screen.getByRole('button', { name: /nieuw potje voor leefgeld/i }))
    const input = screen.getByPlaceholderText(/naam/i)
    fireEvent.change(input, { target: { value: 'Boodschappen' } })
    fireEvent.click(screen.getByRole('button', { name: /bevestigen/i }))
    expect(onToevoegen).toHaveBeenCalledWith('Boodschappen', 'LEEFGELD')
  })

  it('calls onSluiten when close button is clicked', () => {
    const onSluiten = vi.fn()
    render(
      <PotjesBeheerDialog open potjes={[]} onSluiten={onSluiten}
        onToevoegen={vi.fn()} onVerwijderen={vi.fn()} onHernoemen={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /sluiten/i }))
    expect(onSluiten).toHaveBeenCalled()
  })
})
