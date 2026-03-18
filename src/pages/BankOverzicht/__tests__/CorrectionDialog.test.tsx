import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CorrectionDialog } from '../components/CorrectionDialog'
import type { CategorizedTransaction, Potje } from '../types'

const tx = (id: string): CategorizedTransaction => ({
  id,
  datum: '2023-06-15',
  bedrag: -25.00,
  omschrijving: '',
  tegenrekening: null,
  tegenpartij: 'Onbekende Winkel',
  bronBestand: 'test.csv',
  bankFormat: 'ING',
  bucket: 'ONBEKEND',
  subCategorie: null,
  isHandmatig: false,
  isDuplicaat: false,
  regelNaam: null,
})

const noPotjes: Potje[] = []
const somePotjes: Potje[] = [
  { id: 'p-1', naam: 'Huur', bucket: 'VASTE_LASTEN' },
  { id: 'p-2', naam: 'Boodschappen', bucket: 'LEEFGELD' },
]

describe('CorrectionDialog', () => {
  it('renders when open', () => {
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={noPotjes}
        onSluiten={vi.fn()} onCorrectie={vi.fn()} onRegelToepassen={vi.fn()} />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <CorrectionDialog open={false} transacties={[tx('1')]} potjes={noPotjes}
        onSluiten={vi.fn()} onCorrectie={vi.fn()} onRegelToepassen={vi.fn()} />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows all four assignable bucket options', () => {
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={noPotjes}
        onSluiten={vi.fn()} onCorrectie={vi.fn()} onRegelToepassen={vi.fn()} />,
    )
    expect(screen.getByRole('radio', { name: /inkomsten/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /leefgeld/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /vaste lasten/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /sparen/i })).toBeInTheDocument()
  })

  it('calls onCorrectie with bucket and null subCategorie when no potje selected', () => {
    const onCorrectie = vi.fn()
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={noPotjes}
        onSluiten={vi.fn()} onCorrectie={onCorrectie} onRegelToepassen={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: /inkomsten/i }))
    fireEvent.click(screen.getByRole('button', { name: /opslaan/i }))
    expect(onCorrectie).toHaveBeenCalledWith(['1'], 'INKOMEN', null)
  })

  it('calls onRegelToepassen when apply-all is checked', () => {
    const onRegelToepassen = vi.fn()
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={noPotjes}
        onSluiten={vi.fn()} onCorrectie={vi.fn()} onRegelToepassen={onRegelToepassen} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: /vaste lasten/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /toepassen op alle/i }))
    fireEvent.click(screen.getByRole('button', { name: /opslaan/i }))
    expect(onRegelToepassen).toHaveBeenCalledWith({
      tegenpartijPatroon: 'Onbekende Winkel',
      bucket: 'VASTE_LASTEN',
    })
  })

  it('calls onSluiten when cancel is clicked', () => {
    const onSluiten = vi.fn()
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={noPotjes}
        onSluiten={onSluiten} onCorrectie={vi.fn()} onRegelToepassen={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /annuleren/i }))
    expect(onSluiten).toHaveBeenCalled()
  })

  it('shows potje dropdown for non-ONBEKEND bucket', () => {
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={somePotjes}
        onSluiten={vi.fn()} onCorrectie={vi.fn()} onRegelToepassen={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: /vaste lasten/i }))
    expect(screen.getByLabelText(/potje/i)).toBeInTheDocument()
  })

  it('filters potje dropdown to selected bucket', () => {
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={somePotjes}
        onSluiten={vi.fn()} onCorrectie={vi.fn()} onRegelToepassen={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: /vaste lasten/i }))
    const selectField = screen.getByLabelText(/potje/i)
    fireEvent.mouseDown(selectField)
    expect(screen.getByText('Huur')).toBeInTheDocument()
    expect(screen.queryByText('Boodschappen')).not.toBeInTheDocument()
  })

  it('shows disabled hint when selected bucket has no potjes', () => {
    render(
      <CorrectionDialog open transacties={[tx('1')]} potjes={noPotjes}
        onSluiten={vi.fn()} onCorrectie={vi.fn()} onRegelToepassen={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: /leefgeld/i }))
    expect(screen.getByText(/geen potjes/i)).toBeInTheDocument()
  })
})
