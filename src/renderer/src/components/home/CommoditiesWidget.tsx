import { useMemo } from 'react'
import { BarChart2, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCommodityPrices } from '../../hooks/useCommodityPrices'
import { useStaticData } from '../../hooks/useStaticData'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { WidgetCard } from './WidgetCard'
import { EmptyStateCard } from './EmptyStateCard'

const ACCENT = '#00e5ff'
const AUTO_REFRESH_MS = 5 * 60 * 1000
const TOP_N = 8

interface TradeOpportunity {
  commodityName: string
  commodityCode: string
  buyTerminal: string
  sellTerminal: string
  buyPrice: number
  sellPrice: number
  margin: number
}

function buildTopOpportunities(
  commodities: ReturnType<typeof useStaticData>['commodities'],
  prices: ReturnType<typeof useCommodityPrices>['prices']
): TradeOpportunity[] {
  const priceMap = new Map<number, typeof prices>()
  for (const p of prices) {
    const list = priceMap.get(p.id_commodity) ?? []
    list.push(p)
    priceMap.set(p.id_commodity, list)
  }

  const opportunities: TradeOpportunity[] = []

  for (const commodity of commodities) {
    const rows = priceMap.get(commodity.id) ?? []
    const buyRows = rows.filter((r) => r.price_buy > 0)
    const sellRows = rows.filter((r) => r.price_sell > 0)
    if (!buyRows.length || !sellRows.length) continue

    const bestBuyRow = buyRows.reduce((a, b) => (a.price_buy < b.price_buy ? a : b))
    const bestSellRow = sellRows.reduce((a, b) => (a.price_sell > b.price_sell ? a : b))

    const margin = bestSellRow.price_sell - bestBuyRow.price_buy
    if (margin <= 0) continue

    opportunities.push({
      commodityName: commodity.name,
      commodityCode: commodity.code,
      buyTerminal: bestBuyRow.terminal_name,
      sellTerminal: bestSellRow.terminal_name,
      buyPrice: bestBuyRow.price_buy,
      sellPrice: bestSellRow.price_sell,
      margin
    })
  }

  return opportunities.sort((a, b) => b.margin - a.margin).slice(0, TOP_N)
}

// Colonne: CODE | COMMODITY | BUY LOCATION | SELL LOCATION | MARGIN
const COL_TEMPLATE = '2.5rem 1fr 1fr 1fr 5.5rem'

export function CommoditiesWidget() {
  const { t } = useTranslation()
  const { prices, isLoading, isFetching, cooldown, refresh } = useCommodityPrices()
  const { commodities } = useStaticData()

  useAutoRefresh(refresh, AUTO_REFRESH_MS, !isLoading)

  const opportunities = useMemo(
    () => buildTopOpportunities(commodities, prices),
    [commodities, prices]
  )

  const isEmpty = !isLoading && prices.length === 0
  const showSkeleton = isLoading || (isFetching && opportunities.length === 0)

  return (
    <WidgetCard
      title={t('home.commodities.title')}
      icon={BarChart2}
      accentColor={ACCENT}
      navigateTo="/commodities"
      quickAction={{
        label: cooldown > 0 ? `${cooldown}s` : t('home.commodities.refresh'),
        icon: RefreshCw,
        onClick: refresh
      }}
    >
      {isEmpty ? (
        <EmptyStateCard
          icon={BarChart2}
          title={t('home.commodities.emptyTitle')}
          description={t('home.commodities.empty')}
          accentColor={ACCENT}
        />
      ) : showSkeleton ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hud">
          {/* Column headers */}
          <div
            className="grid px-3 py-1.5 border-b border-hud-border/40 shrink-0"
            style={{ gridTemplateColumns: COL_TEMPLATE }}
          >
            <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>{t('home.commodities.col.code')}</span>
            <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>{t('home.commodities.col.commodity')}</span>
            <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>{t('home.commodities.buy')}</span>
            <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>{t('home.commodities.sell')}</span>
            <span className="hud-label text-hud-dim text-right" style={{ fontSize: '9px' }}>
              {t('home.commodities.margin')}
            </span>
          </div>

          {opportunities.map((opp, i) => (
            <OpportunityRow key={i} opp={opp} rank={i} />
          ))}
        </div>
      )}
    </WidgetCard>
  )
}

function OpportunityRow({ opp, rank }: { opp: TradeOpportunity; rank: number }) {
  // Primo risultato ha il margine evidenziato di più
  const marginColor = rank === 0 ? 'text-hud-green' : rank <= 2 ? 'text-hud-green/80' : 'text-hud-green/60'

  return (
    <div
      className="grid items-center px-3 py-2 border-b border-hud-border/20 last:border-0 gap-1"
      style={{ gridTemplateColumns: COL_TEMPLATE }}
    >
      <span className="font-mono text-[10px] text-hud-cyan tracking-wide">{opp.commodityCode}</span>

      <span className="font-mono text-[10px] text-hud-text truncate pr-1">{opp.commodityName}</span>

      <span className="font-mono text-[10px] text-hud-muted truncate pr-1">{opp.buyTerminal}</span>

      <span className="font-mono text-[10px] text-hud-muted truncate pr-1">{opp.sellTerminal}</span>

      <div className="flex flex-col items-end">
        <span className={`font-mono text-[10px] tabular-nums font-bold ${marginColor}`}>
          +{opp.margin.toLocaleString('en-US')}
        </span>
        <span className="hud-label text-hud-dim tabular-nums" style={{ fontSize: '8px' }}>
          {opp.buyPrice.toLocaleString('en-US')} → {opp.sellPrice.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-3">
      {Array.from({ length: TOP_N }).map((_, i) => (
        <div key={i} className="h-8 bg-hud-border/20 animate-pulse" />
      ))}
    </div>
  )
}
