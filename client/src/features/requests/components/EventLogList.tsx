import {
  UserCheck, RefreshCw, Plus, CheckCircle,
  XCircle, Trash2, Edit, LogOut, UserMinus
} from 'lucide-react'
import type { EventLogItem } from '../../../api/types'
import { formatDateTime } from '../../../hooks/useDateTime'

const EVENT_CONFIG = {
  0: { label: 'Виконавця призначено', icon: UserCheck,   color: 'text-success' },
  1: { label: 'Статус змінено',       icon: RefreshCw,   color: 'text-info' },
  2: { label: 'Етап запропоновано',   icon: Plus,        color: 'text-warning' },
  3: { label: 'Етап підтверджено',    icon: CheckCircle, color: 'text-success' },
  4: { label: 'Етап відхилено',       icon: XCircle,     color: 'text-error' },
  5: { label: 'Етап видалено',        icon: Trash2,      color: 'text-ink-muted' },
  6: { label: 'Заявку відредаговано', icon: Edit,        color: 'text-info' },
  7: { label: 'Виконавець відмовився',icon: LogOut,      color: 'text-error' },
  8: { label: 'Виконавця знято',      icon: UserMinus,   color: 'text-error' },
} as const

function parsePayload(payload: string): Record<string, string> {
  try {
    return JSON.parse(payload)
  } catch {
    return {}
  }
}

export default function EventLogList({ events }: { events: EventLogItem[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-ink-muted text-sm">
        Подій поки немає
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map(event => {
        const config = EVENT_CONFIG[event.eventType as keyof typeof EVENT_CONFIG]
        if (!config) return null
        const Icon = config.icon
        const payload = parsePayload(event.payload)

        return (
          <div key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-surface-muted border border-border-muted">
            <div className={`mt-0.5 flex-shrink-0 ${config.color}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">{config.label}</p>
              {payload.reason && (
                <p className="text-xs text-ink-muted mt-0.5">
                  Причина: {payload.reason}
                </p>
              )}
              {payload.newStatus && (
                <p className="text-xs text-ink-muted mt-0.5">
                  {payload.previousStatus} → {payload.newStatus}
                </p>
              )}
            </div>
            <span className="text-xs text-ink-soft flex-shrink-0">
              {formatDateTime(event.createdAtUtc, 'full')}
            </span>
          </div>
        )
      })}
    </div>
  )
}