import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWalletEntries, computeBalance } from '../../hooks/useWallet'
import { WidgetCard } from './WidgetCard'
import { EmptyStateCard } from './EmptyStateCard'

const ACCENT = '#00e87a'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function WalletWidget({ onAddEntry }: { onAddEntry: () => void }) {
  const { t } = useTranslation()
  const { data: entries = [] } = useWalletEntries()

  const stats = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - SEVEN_DAYS_MS
    const balance = computeBalance(entries)
    const balanceWeekAgo = computeBalance(entries.filter((e) => e.dateAdded < weekAgo))
    const trend =
      balanceWeekAgo !== 0 ? ((balance - balanceWeekAgo) / Math.abs(balanceWeekAgo)) * 100 : null
    return { balance, trend }
  }, [entries])

  const formatCompact = (n: number): string => {
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toLocaleString('en-US')
  }

  return (
    <WidgetCard
      title={t('home.wallet.title')}
      icon={Wallet}
      accentColor={ACCENT}
      navigateTo="/wallet"
      quickAction={{ label: "", icon: Plus, onClick: onAddEntry }}
    >
      {entries.length === 0 ? (
        <EmptyStateCard
          icon={Wallet}
          title={t('home.wallet.emptyTitle')}
          description={t('home.wallet.empty')}
          accentColor={ACCENT}
          action={{ label: "", onClick: (e) => { e.stopPropagation(); onAddEntry() } }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1 px-2 py-1">
          <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>
            {t('home.wallet.balance')}
          </span>
          <span
            className="font-mono text-base font-bold leading-none tabular-nums text-center"
            style={{ color: ACCENT }}
          >
            {formatCompact(stats.balance)}
          </span>
          <span className="hud-label text-hud-dim" style={{ fontSize: '8px' }}>aUEC</span>
          {stats.trend !== null && (
            <div
              className={`flex items-center gap-0.5 mt-0.5 ${stats.trend >= 0 ? 'text-hud-green' : 'text-hud-red'}`}
            >
              {stats.trend >= 0 ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              <span className="font-mono text-[10px] tabular-nums">
                {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
