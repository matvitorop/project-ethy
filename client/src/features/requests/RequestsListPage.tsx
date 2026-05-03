import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { GET_HELP_REQUESTS } from '../../api/queries'
import type { HelpRequestsPageData } from '../../api/types'
import RequestCard from './RequestCard'
import { PageSpinner } from '../../components/Spinner'

const PAGE_SIZE = 10

const TABS = [
    { key: 'open', label: 'Відкриті', status: 'Open', statuses: null },
    { key: 'inProgress', label: 'В процесі', status: 'InProgress', statuses: null },
    { key: 'archive', label: 'Архів', status: null, statuses: ['Resolved', 'Cancelled'] },
] as const

type Tab = typeof TABS[number]['key']

export default function RequestsListPage() {
    const [activeTab, setActiveTab] = useState<Tab>('open')
    const [page, setPage] = useState(1)

    const currentTab = TABS.find(t => t.key === activeTab)!

    const { data, loading, error } = useQuery<HelpRequestsPageData>(GET_HELP_REQUESTS, {
        variables: {
            page,
            pageSize: PAGE_SIZE,
            status: currentTab.status ?? null,
            statuses: currentTab.statuses ?? null,
        },
        fetchPolicy: 'cache-and-network',
    })

    const items = data?.helpRequestQuer.helpRequestQuery.items ?? []
    const hasNext = items.length === PAGE_SIZE
    const hasPrev = page > 1

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab)
        setPage(1)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-ink"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Заявки на допомогу
                    </h1>
                    <p className="text-sm text-ink-muted mt-1">
                        Переглядайте запити та долучайтесь до допомоги
                    </p>
                </div>
                <Link
                    to="/requests/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors"
                >
                    <Plus size={16} />
                    Створити заявку
                </Link>
            </div>

            <div className="flex gap-1 mb-6 bg-surface-muted rounded-lg p-1 w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key
                                ? 'bg-surface text-ink shadow-sm'
                                : 'text-ink-muted hover:text-ink'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading && <PageSpinner />}

            {error && (
                <div className="text-center py-16 text-error">
                    Помилка завантаження заявок
                </div>
            )}

            {!loading && !error && items.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-ink-muted text-lg mb-2">Заявок немає</p>
                    <p className="text-ink-soft text-sm">
                        {activeTab === 'open'
                            ? 'Поки немає відкритих заявок'
                            : 'В цій категорії заявок немає'}
                    </p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="space-y-3">
                    {items.map(item => (
                        <RequestCard key={item.id} item={item} />
                    ))}
                </div>
            )}

            {!loading && (hasPrev || hasNext) && (
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={!hasPrev}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:border-primary text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Попередня
                    </button>

                    <span className="text-sm text-ink-muted">
                        Сторінка {page}
                    </span>

                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasNext}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:border-primary text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Наступна
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}