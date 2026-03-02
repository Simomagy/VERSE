import { Ship, Plus, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalFleet } from '../../hooks/useFleet'
import { WidgetCard } from './WidgetCard'
import { EmptyStateCard } from './EmptyStateCard'

const ACCENT = '#4080ff'

export function FleetWidget({ onAddShip }: { onAddShip: () => void }) {
  const { t } = useTranslation()
  const { data: ships = [] } = useLocalFleet()

  const totalScu = ships.reduce((sum, s) => sum + s.cargoCapacity, 0)

  return (
    <WidgetCard
      title={t('home.fleet.title')}
      icon={Ship}
      accentColor={ACCENT}
      navigateTo="/fleet"
      quickAction={{ label: t('fleet.addVessel'), icon: Plus, onClick: onAddShip }}
    >
      {ships.length === 0 ? (
        <EmptyStateCard
          icon={Ship}
          title={t('home.fleet.emptyTitle')}
          description={t('home.fleet.empty')}
          accentColor={ACCENT}
          action={{ label: t('fleet.addVessel'), onClick: (e) => { e.stopPropagation(); onAddShip() } }}
        />
      ) : (
        <>
        <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center justify-center h-full gap-1 px-2 py-1">
          <span className="font-mono text-2xl font-bold leading-none" style={{ color: ACCENT }}>
            {ships.length}
          </span>
          <span className="hud-label text-hud-dim text-center leading-tight" style={{ fontSize: '9px' }}>
            {t('home.fleet.vessels')}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {totalScu > 0 && (
            <div className="flex items-center gap-0.5 mt-1">
              <Package className="h-2.5 w-2.5 text-hud-muted" />
              <span className="font-mono text-[10px] text-hud-muted tabular-nums">{totalScu}</span>
              <span className="hud-label text-hud-dim" style={{ fontSize: '8px' }}>SCU</span>
            </div>
          )}
          </div>
          </div>
          </>
      )}
    </WidgetCard>
  )
}
