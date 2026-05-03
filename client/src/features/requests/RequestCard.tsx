import { Link } from 'react-router-dom'
import type { HelpRequestListItem } from '../../api/types'

const STATUS_CONFIG = {
    0: { label: 'Чернетка', color: 'bg-ink-soft/20 text-ink-muted' },
    1: { label: 'Відкрита', color: 'bg-success/15 text-success' },
    2: { label: 'В процесі', color: 'bg-info/15 text-info' },
    3: { label: 'Виконана', color: 'bg-violet-100 text-violet-600' },
    4: { label: 'Скасована', color: 'bg-error/15 text-error' },
} as const

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default function RequestCard({ item }: { item: HelpRequestListItem }) {
    const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]

    return (
        <Link
            to={`/requests/${item.id}`}
            className="block bg-surface rounded-xl border border-border p-5 hover:border-primary hover:shadow-sm transition-all group"
        >
            <div className="flex gap-4">
                {/* Прев'ю зображення */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-surface-muted border border-border overflow-hidden">
                    {item.previewImageUrl ? (
                        <img
                            src={`http://localhost:5274${item.previewImageUrl}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xl">
                            📦
                        </div>
                    )}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-ink group-hover:text-primary transition-colors truncate">
                            {item.title}
                        </h3>
                        {statusConfig && (
                            <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-ink-muted">
                        {formatDate(item.createdAt)}
                    </p>
                </div>
            </div>
        </Link>
    )
}