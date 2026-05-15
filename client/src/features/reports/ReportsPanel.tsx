import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { X, ClipboardList } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeReportsPanel } from '../../store/uiSlice'
import { GET_PENDING_REPORTS } from '../../api/queries'
import type { HelpRequestsPageData } from '../../api/types'
import { formatDateTime } from '../../hooks/useDateTime'
import { PageSpinner } from '../../components/Spinner'

export default function ReportsPanel() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const isOpen = useAppSelector(s => s.ui.reportsPanelOpen)
    const userId = useAppSelector(s => s.auth.userId)

    const { data, loading } = useQuery<HelpRequestsPageData>(GET_PENDING_REPORTS, {
        variables: { page: 1, pageSize: 20, creatorId: userId },
        skip: !isOpen || !userId,
        fetchPolicy: 'network-only',
    })

    const items = data?.helpRequestQuer.helpRequestQuery.items ?? []

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/30"
                onClick={() => dispatch(closeReportsPanel())}
            />

            <div className="fixed right-0 top-0 h-full w-80 bg-surface border-l border-border z-50 flex flex-col shadow-xl">
                <div className="px-4 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-ink"
                            style={{ fontFamily: 'Jua, sans-serif' }}>
                            Звіти
                        </h2>
                        {items.length > 0 && (
                            <p className="text-xs text-ink-muted mt-0.5">
                                {items.length} заявок потребують звіту
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => dispatch(closeReportsPanel())}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-32">
                            <PageSpinner />
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <ClipboardList size={32} className="text-ink-soft mx-auto mb-3" />
                            <p className="text-ink-muted text-sm">Всі заявки мають звіти</p>
                            <p className="text-ink-soft text-xs mt-1">
                                Чудова робота!
                            </p>
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div className="divide-y divide-border">
                            {items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        navigate(`/requests/${item.id}`)
                                        dispatch(closeReportsPanel())
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-surface-muted transition-colors flex gap-3 items-start"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-muted border border-border overflow-hidden">
                                        {item.previewImageUrl ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_BASE_URL}${item.previewImageUrl}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-ink-soft text-sm">
                                                📦
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-ink truncate">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-ink-muted mt-0.5">
                                            {formatDateTime(item.createdAt, 'short')}
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-warning/15 text-warning rounded-full">
                                            Потребує звіту
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}