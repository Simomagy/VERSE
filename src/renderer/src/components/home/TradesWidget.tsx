import { useMemo } from 'react'
import { History, Plus, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalTrades } from '../../hooks/useTrades'
import { formatRelativeTime, cn } from '../../lib/utils'
import { WidgetCard } from './WidgetCard'
import { EmptyStateCard } from './EmptyStateCard'
import type { LocalTrade } from '../../api/types'

const ACCENT = '#e8a020'
const MAX_ROWS = 8

export function TradesWidget({ onLogTrade }: { onLogTrade: () => void }) {
  const { t } = useTranslation()
  const { data: trades = [] } = useLocalTrades()

  const recent = useMemo(
    () => [...trades].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, MAX_ROWS),
    [trades]
  )

  const totalRecentProfit = useMemo(
    () => recent.reduce((sum, tr) => sum + tr.netProfit, 0),
    [recent]
  )

  const isPositive = totalRecentProfit >= 0

  return (
    <WidgetCard
      title={t('home.trades.title')}
      icon={History}
      accentColor={ACCENT}
      navigateTo="/trades"
      quickAction={{ label: t('home.trades.logTrade'), icon: Plus, onClick: onLogTrade }}
    >
      {trades.length === 0 ? (
        <EmptyStateCard
          icon={History}
          title={t('home.trades.emptyTitle')}
          description={t('home.trades.empty')}
          accentColor={ACCENT}
          action={{ label: t('home.trades.logTrade'), onClick: (e) => { e.stopPropagation(); onLogTrade() } }}
        />
      ) : (
        <div className="flex flex-col h-full">
          {/* Profit summary — prominent */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b border-hud-border/50 shrink-0"
            style={{ background: `linear-gradient(90deg, ${ACCENT}0a 0%, transparent 70%)` }}
          >
            <span className="hud-label text-hud-dim">{t('home.trades.totalProfit')}</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-mono text-base font-bold tabular-nums leading-none',
                  isPositive ? 'text-hud-green' : 'text-hud-red'
                )}
              >
                {isPositive ? '+' : ''}
                {totalRecentProfit.toLocaleString('en-US')}
              </span>
              <span className="font-mono text-[10px] text-hud-muted">aUEC</span>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid items-center px-4 py-1 border-b border-hud-border/30 shrink-0"
            style={{ gridTemplateColumns: '1fr 5rem 4rem' }}>
            <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>{t('home.trades.col.route')}</span>
            <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>{t('home.trades.col.profit')}</span>
            <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>{t('home.trades.col.when')}</span>
          </div>

          {/* Trades list */}
          <div className="flex-1 overflow-y-auto scrollbar-hud">
            {recent.map((trade) => (
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}

function TradeRow({ trade }: { trade: LocalTrade }) {
  const isProfit = trade.netProfit >= 0
  const ProfitIcon = isProfit ? TrendingUp : TrendingDown
  const commodityNames = trade.items.map((i) => i.commodity).join(', ')
  const hasRoute = trade.locationFrom && trade.locationTo

  return (
    <div
      className="grid items-center px-4 py-2 border-b border-hud-border/20 last:border-0 gap-2"
      style={{ gridTemplateColumns: '1fr 5rem 4rem' }}
    >
      {/* Route + commodity */}
      <div className="min-w-0">
        {hasRoute && (
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-mono text-[10px] text-hud-text truncate max-w-[5rem]">
              {trade.locationFrom}
            </span>
            <ArrowRight className="h-2.5 w-2.5 text-hud-muted shrink-0" />
            <span className="font-mono text-[10px] text-hud-text truncate max-w-[5rem]">
              {trade.locationTo}
            </span>
          </div>
        )}
        <p className="hud-label text-hud-dim truncate" style={{ fontSize: '9px' }}>
          {commodityNames || '—'}
        </p>
      </div>

      {/* Profit */}
      <div className={cn('flex items-center justify-end gap-0.5', isProfit ? 'text-hud-green' : 'text-hud-red')}>
        <ProfitIcon className="h-2.5 w-2.5 shrink-0" />
        <span className="font-mono text-xs tabular-nums font-semibold">
          {isProfit ? '+' : ''}{trade.netProfit.toLocaleString('en-US')}
        </span>
      </div>

      {/* Time */}
      <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>
        {formatRelativeTime(trade.dateAdded)}
      </span>
    </div>
  )
}
