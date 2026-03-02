import { useState, useEffect, useMemo } from 'react'
import { FlaskConical, Plus, Clock, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalRefineryJobs } from '../../hooks/useRefineryJobs'
import { formatUEC } from '../../lib/utils'
import { WidgetCard } from './WidgetCard'
import { EmptyStateCard } from './EmptyStateCard'
import { cn } from '../../lib/utils'
import type { LocalRefineryJob } from '../../api/types'

const ACCENT = '#a060ff'

function formatDuration(ms: number): string {
  if (ms <= 0) return 'READY'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

function JobTimer({ job }: { job: LocalRefineryJob }) {
  const { t } = useTranslation()
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (job.refineDurationMinutes <= 0) {
    return (
      <span className="hud-label text-hud-dim" style={{ fontSize: '9px' }}>
        {t('home.refinery.noTimer')}
      </span>
    )
  }

  const endMs = job.dateAdded + job.refineDurationMinutes * 60 * 1000
  const remaining = endMs - now
  const isReady = remaining <= 0

  return (
    <div className={cn('flex items-center gap-1', isReady ? 'text-hud-green' : 'text-hud-amber')}>
      {isReady ? (
        <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
      ) : (
        <Clock className="h-2.5 w-2.5 shrink-0" />
      )}
      <span className="font-mono text-[10px] tabular-nums font-semibold">
        {isReady ? t('home.refinery.ready') : formatDuration(remaining)}
      </span>
    </div>
  )
}

export function RefineryWidget({ onLogJob }: { onLogJob: () => void }) {
  const { t } = useTranslation()
  const { data: jobs = [] } = useLocalRefineryJobs()

  const activeJobs = useMemo(() => {
    const now = Date.now()
    return [...jobs]
      .filter((j) => {
        if (j.refineDurationMinutes <= 0) return true
        return j.dateAdded + j.refineDurationMinutes * 60 * 1000 >= now - 60 * 60 * 1000
      })
      .sort((a, b) => {
        const endA = a.dateAdded + a.refineDurationMinutes * 60 * 1000
        const endB = b.dateAdded + b.refineDurationMinutes * 60 * 1000
        return endA - endB
      })
      .slice(0, 5)
  }, [jobs])

  return (
    <WidgetCard
      title={t('home.refinery.title')}
      icon={FlaskConical}
      accentColor={ACCENT}
      navigateTo="/refinery"
      quickAction={{ label: t('home.refinery.logJob'), icon: Plus, onClick: onLogJob }}
    >
      {activeJobs.length === 0 ? (
        <EmptyStateCard
          icon={FlaskConical}
          title={t('home.refinery.emptyTitle')}
          description={t('home.refinery.empty')}
          accentColor={ACCENT}
          action={{ label: t('home.refinery.logJob'), onClick: (e) => { e.stopPropagation(); onLogJob() } }}
        />
      ) : (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hud">
          {activeJobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </WidgetCard>
  )
}

function JobRow({ job }: { job: LocalRefineryJob }) {
  const totalScuOut = job.minerals.reduce((sum, m) => sum + m.scuOutput, 0)
  const mineralNames = job.minerals.map((m) => m.mineral).join(', ')

  return (
    <div className="px-3 py-2 border-b border-hud-border/25 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] text-hud-text truncate">{job.refinery}</p>
          <p className="hud-label text-hud-dim truncate" style={{ fontSize: '9px' }}>
            {mineralNames || '—'} · {job.method}
          </p>
        </div>
        <JobTimer job={job} />
      </div>

      <div className="flex items-center gap-3 mt-1">
        {totalScuOut > 0 && (
          <span className="hud-label text-hud-muted" style={{ fontSize: '9px' }}>
            {totalScuOut.toFixed(2)} SCU
          </span>
        )}
        {job.netProfit > 0 && (
          <span className="font-mono text-[9px] text-hud-green tabular-nums">
            +{formatUEC(job.netProfit)}
          </span>
        )}
      </div>
    </div>
  )
}
