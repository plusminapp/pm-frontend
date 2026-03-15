import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CorrectionDialog } from '../components/CorrectionDialog'
import type { CategorizedTransaction } from '../types'

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

describe('CorrectionDialog', () => {
  it('renders when open', () => {
    render(
      <CorrectionDialog
        open
        transacties={[tx('1')]}
        onSluiten={vi.fn()}
        onCorrectie={vi.fn()}
        onRegelToepassen={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <CorrectionDialog
        open={false}
        transacties={[tx('1')]}
        onSluiten={vi.fn()}
        onCorrectie={vi.fn()}
        onRegelToepassen={vi.fn()}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows all four assignable bucket options', () => {
    render(
      <CorrectionDialog
        open
        transacties={[tx('1')]}
        onSluiten={vi.fn()}
        onCorrectie={vi.fn()}
        onRegelToepassen={vi.fn()}
      />,
    )
    expect(screen.getByRole('radio', { name: /inkomsten/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /leefgeld/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /vaste lasten/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /sparen/i })).toBeInTheDocument()
  })

  it('calls onCorrectie with selected bucket when apply-all is unchecked', () => {
    const onCorrectie = vi.fn()
    render(
      <CorrectionDialog
        open
        transacties={[tx('1')]}
        onSluiten={vi.fn()}
        onCorrectie={onCorrectie}
        onRegelToepassen={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('radio', { name: /inkomsten/i }))
    fireEvent.click(screen.getByRole('button', { name: /opslaan/i }))
    expect(onCorrectie).toHaveBeenCalledWith(['1'], 'INKOMEN')
  })

  it('calls onRegelToepassen when apply-all is checked', () => {
    const onRegelToepassen = vi.fn()
    render(
      <CorrectionDialog
        open
        transacties={[tx('1')]}
        onSluiten={vi.fn()}
        onCorrectie={vi.fn()}
        onRegelToepassen={onRegelToepassen}
      />,
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
      <CorrectionDialog
        open
        transacties={[tx('1')]}
        onSluiten={onSluiten}
        onCorrectie={vi.fn()}
        onRegelToepassen={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /annuleren/i }))
    expect(onSluiten).toHaveBeenCalled()
  })
})
