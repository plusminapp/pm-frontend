import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CategorizedTransaction, Bucket, UserRule } from '../types'
import { exportRules } from './exportRules'

const BUCKET_LABELS: Record<Bucket, string> = {
  INKOMEN: 'Inkomsten',
  LEEFGELD: 'Leefgeld',
  VASTE_LASTEN: 'Vaste lasten',
  SPAREN: 'Sparen',
  ONBEKEND: 'Onbekend',
}

const BUCKET_COLORS: Record<Bucket, [number, number, number]> = {
  INKOMEN:      [34,  197, 94],
  LEEFGELD:     [239, 68,  68],
  VASTE_LASTEN: [59,  130, 246],
  SPAREN:       [245, 158, 11],
  ONBEKEND:     [156, 163, 175],
}

type MonthlyTotals = Record<number, Partial<Record<Bucket, number>>>

function buildMonthlyTotals(transactions: CategorizedTransaction[]): MonthlyTotals {
  const totals: MonthlyTotals = {}
  for (let m = 1; m <= 12; m++) totals[m] = {}
  for (const tx of transactions) {
    const month = parseInt(tx.datum.slice(5, 7), 10)
    const bucket = tx.bucket
    if (bucket === 'ONBEKEND') continue
    totals[month][bucket] = (totals[month][bucket] ?? 0) + tx.bedrag
  }
  return totals
}

function buildBucketSummary(
  transactions: CategorizedTransaction[],
): Record<Bucket, { totaal: number; gemiddeld: number }> {
  const sums: Partial<Record<Bucket, number>> = {}
  for (const tx of transactions) {
    if (tx.bucket === 'ONBEKEND') continue
    sums[tx.bucket] = (sums[tx.bucket] ?? 0) + tx.bedrag
  }
  const buckets: Bucket[] = ['INKOMEN', 'LEEFGELD', 'VASTE_LASTEN', 'SPAREN']
  return Object.fromEntries(
    buckets.map((b) => [b, { totaal: sums[b] ?? 0, gemiddeld: (sums[b] ?? 0) / 12 }]),
  ) as Record<Bucket, { totaal: number; gemiddeld: number }>
}

function topTegenpartijen(
  transactions: CategorizedTransaction[],
  bucket: Bucket,
  n = 10,
): Array<{ naam: string; totaal: number }> {
  const sums = new Map<string, number>()
  for (const tx of transactions.filter((t) => t.bucket === bucket)) {
    sums.set(tx.tegenpartij, (sums.get(tx.tegenpartij) ?? 0) + tx.bedrag)
  }
  return [...sums.entries()]
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, n)
    .map(([naam, totaal]) => ({ naam, totaal }))
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}

const MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

export function exportPdf(
  transactions: CategorizedTransaction[],
  jaar: number,
  userRules: UserRule[] = [],
  learnedRules: UserRule[] = [],
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const summary = buildBucketSummary(transactions)
  const monthlyTotals = buildMonthlyTotals(transactions)
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, pageWidth, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`PlusMin Jaaroverzicht ${jaar}`, 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Gegenereerd op ${new Date().toLocaleDateString('nl-NL')}`, pageWidth - 14, 12, { align: 'right' })

  // Bucket summary table
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Jaaroverzicht per categorie', 14, 28)

  const buckets: Bucket[] = ['INKOMEN', 'LEEFGELD', 'VASTE_LASTEN', 'SPAREN']
  autoTable(doc, {
    startY: 32,
    head: [['Categorie', 'Jaartotaal', 'Maandgemiddelde']],
    body: buckets.map((b) => [
      BUCKET_LABELS[b],
      formatEur(summary[b].totaal),
      formatEur(summary[b].gemiddeld),
    ]),
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
  })

  // Monthly breakdown table
  const afterSummary = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Maandelijks overzicht', 14, afterSummary)

  autoTable(doc, {
    startY: afterSummary + 4,
    head: [['Maand', 'Inkomsten', 'Leefgeld', 'Vaste lasten', 'Sparen']],
    body: Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const t = monthlyTotals[m]
      return [
        MAANDEN[i],
        formatEur(t.INKOMEN ?? 0),
        formatEur(t.LEEFGELD ?? 0),
        formatEur(t.VASTE_LASTEN ?? 0),
        formatEur(t.SPAREN ?? 0),
      ]
    }),
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  })

  // Top counterparties per bucket
  for (const bucket of buckets) {
    doc.addPage()
    const [r, g, b] = BUCKET_COLORS[bucket]
    doc.setFillColor(r, g, b)
    doc.rect(0, 0, pageWidth, 14, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(`Top tegenpartijen — ${BUCKET_LABELS[bucket]}`, 14, 10)

    const top = topTegenpartijen(transactions, bucket)
    autoTable(doc, {
      startY: 18,
      head: [['Tegenpartij', 'Totaal']],
      body: top.map((r) => [r.naam, formatEur(r.totaal)]),
      headStyles: { fillColor: [r, g, b], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
    })
  }

  doc.save(`plusmin-jaaroverzicht-${jaar}.pdf`)

  // Auto-download rules JSON alongside PDF (only if any rules exist)
  if (userRules.length > 0 || learnedRules.length > 0) {
    exportRules(userRules, learnedRules)
  }
}
