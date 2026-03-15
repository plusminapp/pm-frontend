import type { CategorizedTransaction, Bucket } from '../types'
import { TrendingUp, ShoppingCart, Home, PiggyBank } from 'lucide-react'

interface Props {
  transacties: CategorizedTransaction[]
}

interface BucketConfig {
  bucket: Bucket
  label: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
}

const BUCKET_CONFIG: BucketConfig[] = [
  { bucket: 'INKOMEN',      label: 'Inkomsten',    icon: TrendingUp,   colorClass: 'text-green-600',  bgClass: 'bg-green-50' },
  { bucket: 'LEEFGELD',     label: 'Leefgeld',     icon: ShoppingCart, colorClass: 'text-red-600',    bgClass: 'bg-red-50' },
  { bucket: 'VASTE_LASTEN', label: 'Vaste lasten', icon: Home,         colorClass: 'text-blue-600',   bgClass: 'bg-blue-50' },
  { bucket: 'SPAREN',       label: 'Sparen',       icon: PiggyBank,    colorClass: 'text-amber-600',  bgClass: 'bg-amber-50' },
]

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)
}

export function BucketCards({ transacties }: Props) {
  const totals = Object.fromEntries(
    BUCKET_CONFIG.map(({ bucket }) => [
      bucket,
      transacties.filter((t) => t.bucket === bucket).reduce((sum, t) => sum + t.bedrag, 0),
    ]),
  ) as Record<Bucket, number>

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {BUCKET_CONFIG.map(({ bucket, label, icon: Icon, colorClass, bgClass }) => (
        <div key={bucket} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-2 ${bgClass}`}>
              <Icon className={`h-5 w-5 ${colorClass}`} aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-gray-500">{label}</span>
          </div>
          <p className={`mt-3 text-2xl font-bold ${colorClass}`}>
            {formatEur(totals[bucket])}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Gem. {formatEur(totals[bucket] / 12)} / maand
          </p>
        </div>
      ))}
    </div>
  )
}
