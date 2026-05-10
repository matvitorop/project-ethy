import { Link } from 'react-router-dom'
import type { HelpRequestListItem } from '../../api/types'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const STATUS_CONFIG = {
    0: { label: 'Чернетка', variant: 'default' },
    1: { label: 'Відкрита', variant: 'success' },
    2: { label: 'В процесі', variant: 'info' },
    3: { label: 'Виконана', variant: 'outline' },
    4: { label: 'Скасована', variant: 'error' },
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
        <Link to={`/requests/${item.id}`} className="block group">
            <Card padding="none" hoverable className="p-4 transition-all group-hover:border-primary/50">
                <div className="flex gap-4 items-center">
                    {/* Прев'ю зображення */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-surface-muted border border-border overflow-hidden relative shadow-inner">
                        {item.previewImageUrl ? (
                            <img
                                src={`http://localhost:5274${item.previewImageUrl}`}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-soft text-2xl bg-gradient-to-br from-surface-muted to-border/20">
                                📦
                            </div>
                        )}
                    </div>

                    {/* Контент */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-bold text-ink group-hover:text-primary transition-colors truncate tracking-tight">
                                {item.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {statusConfig && (
                                <Badge variant={statusConfig.variant as any}>
                                    {statusConfig.label}
                                </Badge>
                            )}
                            <span className="text-xs text-ink-soft font-medium">
                                {formatDate(item.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}