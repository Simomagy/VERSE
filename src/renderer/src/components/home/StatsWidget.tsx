import { useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalTrades } from '../../hooks/useTrades'
import { useWalletEntries, computeBalance } from '../../hooks/useWallet'
import { WidgetCard } from './WidgetCard'
import { EmptyStateCard } from './EmptyStateCard'

const ACCENT = '#00e5ff'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function formatCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('en-US')
}

export function StatsWidget() {
  const { t } = useTranslation()
  const { data: trades = [] } = useLocalTrades()
  const { data: entries = [] } = useWalletEntries()

  const stats = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - SEVEN_DAYS_MS

    const weeklyProfit = trades
      .filter((tr) => tr.dateAdded >= weekAgo)
      .reduce((sum, tr) => sum + tr.netProfit, 0)

    const avgProfit =
      trades.length > 0
        ? trades.reduce((sum, tr) => sum + tr.netProfit, 0) / trades.length
        : null

    const balanceNow = computeBalance(entries)
    const balanceWeekAgo = computeBalance(entries.filter((e) => e.dateAdded < weekAgo))
    const walletTrend =
      balanceWeekAgo !== 0
        ? ((balanceNow - balanceWeekAgo) / Math.abs(balanceWeekAgo)) * 100
        : null

    return {
      weeklyProfit,
      avgProfit,
      walletTrend,
      hasData: trades.length > 0 || entries.length > 0
    }
  }, [trades, entries])

  return (
    <WidgetCard title={t('home.stats.title')} icon={BarChart3} accentColor={ACCENT}>
      {!stats.hasData ? (
        <EmptyStateCard
          icon={BarChart3}
          title={t('home.stats.noDataTitle')}
          description={t('home.stats.noData')}
          accentColor={ACCENT}
        />
      ) : (
        <div className="flex items-stretch divide-x divide-hud-border/40 h-full">
          <StatCell
            label={t('home.stats.weeklyProfit')}
            value={`${stats.weeklyProfit >= 0 ? '+' : ''}${formatCompact(stats.weeklyProfit)}`}
            sub="aUEC"
            positive={stats.weeklyProfit >= 0}
            showTrend
          />
          <StatCell
            label={t('home.stats.walletTrend')}
            value={
              stats.walletTrend !== null
                ? `${stats.walletTrend >= 0 ? '+' : ''}${stats.walletTrend.toFixed(1)}%`
                : '—'
            }
            positive={stats.walletTrend !== null ? stats.walletTrend >= 0 : null}
            showTrend={stats.walletTrend !== null}
          />
          <StatCell
            label={t('home.stats.avgProfit')}
            value={stats.avgProfit !== null ? formatCompact(stats.avgProfit) : '—'}
            sub={stats.avgProfit !== null ? 'aUEC' : undefined}
            positive={stats.avgProfit !== null ? stats.avgProfit >= 0 : null}
          />
        </div>
      )}
    </WidgetCard>
  )
}

function StatCell({
  label,
  value,
  sub,
  positive,
  showTrend = false
}: {
  label: string
  value: string
  sub?: string
  positive: boolean | null
  showTrend?: boolean
}) {
  const isPositive = positive === true
  const isNegative = positive === false
  const isNeutral = positive === null

  const valueColor = isNeutral
    ? 'text-hud-muted'
    : isPositive
      ? 'text-hud-green'
      : 'text-hud-red'

  const Icon = showTrend ? (isPositive ? TrendingUp : isNegative ? TrendingDown : null) : null

  const bgColor = isNeutral
    ? 'transparent'
    : isPositive
      ? 'rgba(0, 232, 122, 0.04)'
      : 'rgba(255, 60, 60, 0.04)'

  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 flex-1 px-2"
      style={{ background: bgColor }}
    >
      <span className="hud-label text-hud-dim text-center" style={{ fontSize: '9px' }}>
        {label}
      </span>

      <div className={`flex items-center gap-1 ${valueColor}`}>
        {Icon && <Icon className="h-3 w-3 shrink-0" />}
        <span className="font-mono text-sm font-bold tabular-nums leading-none">{value}</span>
      </div>

      {sub && (
        <span className="hud-label text-hud-dim" style={{ fontSize: '8px' }}>
          {sub}
        </span>
      )}
    </div>
  )
}
