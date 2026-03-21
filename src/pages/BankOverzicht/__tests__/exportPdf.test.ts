import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CategorizedTransaction } from '../types'

const { mockDoc, autoTableMock } = vi.hoisted(() => {
  const localMockDoc = {
    internal: { pageSize: { getWidth: () => 210 } },
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    lastAutoTable: { finalY: 60 },
  }

  const localAutoTableMock = vi.fn((doc: typeof localMockDoc, _options?: unknown) => {
    doc.lastAutoTable = { finalY: 80 }
  })

  return { mockDoc: localMockDoc, autoTableMock: localAutoTableMock }
})

vi.mock('jspdf', () => ({
  default: vi.fn(function MockJsPdf() {
    return mockDoc
  }),
}))

vi.mock('jspdf-autotable', () => ({
  default: autoTableMock,
}))

vi.mock('../export/exportRules', () => ({
  exportRules: vi.fn(),
}))

import { exportPdf } from '../export/exportPdf'
import { exportRules } from '../export/exportRules'

const txBase: CategorizedTransaction = {
  id: 'tx-1',
  datum: '2025-01-15',
  bedrag: -12.34,
  omschrijving: 'Interne boeking',
  tegenrekening: null,
  tegenpartij: 'Eigen rekening',
  bronBestand: 'ing.csv',
  bankFormat: 'ING',
  bucket: 'NEGEREN',
  potje: null,
  isHandmatig: true,
  regelNaam: null,
  isDuplicaat: false,
}

describe('exportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('no logo') }))
  })

  it('downloads PDF and includes Negeren in summary bucket rows', async () => {
    await exportPdf([txBase], 2025, [], [], [])

    expect(mockDoc.save).toHaveBeenCalledWith('plusmin-jaaroverzicht.pdf')
    expect(autoTableMock).toHaveBeenCalled()

    const summaryCall = autoTableMock.mock.calls[0]
    const options = summaryCall[1] as unknown as { body: string[][] }
    const summaryLabels = options.body.map((row) => row[0])

    expect(summaryLabels).toContain('Negeren')
    expect(summaryLabels[summaryLabels.length - 1]).toBe('Negeren')
  })

  it('does not export rules JSON alongside PDF when rules exist', async () => {
    await exportPdf([txBase], 2025, [{ tegenpartijPatroon: 'eigen', bucket: 'NEGEREN' }], [], [])
    expect(exportRules).not.toHaveBeenCalled()
  })

  it('groups top tegenpartijen by matching rule pattern', async () => {
    const txA: CategorizedTransaction = { ...txBase, id: 'tx-a', tegenpartij: 'Eigen rekening A', bedrag: -10 }
    const txB: CategorizedTransaction = { ...txBase, id: 'tx-b', tegenpartij: 'Eigen rekening B', bedrag: -20 }

    await exportPdf(
      [txA, txB],
      2025,
      [{ tegenpartijPatroon: 'eigen rekening', bucket: 'NEGEREN' }],
      [],
      [],
    )

    const negerenTopCall = autoTableMock.mock.calls[6]
    const options = negerenTopCall[1] as unknown as { body: Array<[string, string]> }

    expect(options.body).toHaveLength(1)
    expect(options.body[0][0]).toBe('eigen rekening')
  })
})
