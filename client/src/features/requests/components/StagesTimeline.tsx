import { CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'
import type { StageItem } from '../../../api/types'

const STAGE_STATUS = {
    0: { label: 'Очікує', icon: Clock, color: 'text-warning' },
    1: { label: 'Підтверджено', icon: CheckCircle, color: 'text-success' },
    2: { label: 'Відхилено', icon: XCircle, color: 'text-error' },
    3: { label: 'Видалено', icon: Trash2, color: 'text-ink-soft' },
} as const

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default function StagesTimeline({ stages }: { stages: StageItem[] }) {
    if (stages.length === 0) {
        return (
            <div className="text-center py-8 text-ink-muted text-sm">
                Етапів поки немає
            </div>
        )
    }

    return (
        <div className="space-y-0">
            {stages.map((stage, index) => {
                const config = STAGE_STATUS[stage.status as keyof typeof STAGE_STATUS]
                const Icon = config.icon
                const isLast = index === stages.length - 1

                return (
                    <div key={stage.id} className="flex gap-4">
                        {/* Лінія timeline */}
                        <div className="flex flex-col items-center">
                            <div className={`mt-1 ${config.color}`}>
                                <Icon size={18} />
                            </div>
                            {!isLast && (
                                <div className="w-px flex-1 bg-border mt-1 mb-0 min-h-[24px]" />
                            )}
                        </div>

                        {/* Контент */}
                        <div className={`pb-5 flex-1 ${isLast ? '' : ''}`}>
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-ink">{stage.content}</p>
                                <span className={`text-xs font-medium ${config.color} flex-shrink-0`}>
                                    {config.label}
                                </span>
                            </div>
                            <p className="text-xs text-ink-muted mt-0.5">
                                {formatDate(stage.createdAtUtc)}
                            </p>
                            {stage.rejectionReason && (
                                <p className="text-xs text-error mt-1 bg-error/10 px-2 py-1 rounded">
                                    Причина: {stage.rejectionReason}
                                </p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}