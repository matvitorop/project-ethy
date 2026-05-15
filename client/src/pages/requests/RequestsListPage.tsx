import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, Inbox, Search, Hash, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GET_HELP_REQUESTS } from '../../api/queries'
import type { HelpRequestsPageData } from '../../api/types'
import RequestCard from '../../features/requests/RequestCard'
import { PageSpinner } from '../../components/Spinner'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const PAGE_SIZE = 10

const TABS = [
    { key: 'open', label: 'Відкриті', status: 'Open', statuses: null },
    { key: 'inProgress', label: 'В процесі', status: 'InProgress', statuses: null },
    { key: 'archive', label: 'Архів', status: null, statuses: ['Resolved', 'Cancelled'] },
] as const

type Tab = typeof TABS[number]['key']

export default function RequestsListPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    
    // URL State
    const activeTab = (searchParams.get('tab') as Tab) || 'open'
    const page = parseInt(searchParams.get('page') || '1')
    const searchTerm = searchParams.get('q') || ''
    const shortId = searchParams.get('id') || ''

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
    const [debouncedShortId, setDebouncedShortId] = useState(shortId)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedShortId(shortId), 500)
        return () => clearTimeout(timer)
    }, [shortId])

    const currentTab = useMemo(() => TABS.find(t => t.key === activeTab) || TABS[0], [activeTab])

    const { data, loading, error, refetch } = useQuery<HelpRequestsPageData>(GET_HELP_REQUESTS, {
        variables: {
            page,
            pageSize: PAGE_SIZE,
            status: currentTab.status ?? null,
            statuses: currentTab.statuses ?? null,
            searchTerm: debouncedSearch || null,
            shortId: debouncedShortId || null,
        },
        fetchPolicy: 'cache-and-network',
    })

    const items = data?.helpRequestQuer.helpRequestQuery.items ?? []
    const hasNext = items.length === PAGE_SIZE
    const hasPrev = page > 1

    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams)
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') newParams.delete(key)
            else newParams.set(key, value)
        })
        setSearchParams(newParams)
    }

    const handleTabChange = (tab: Tab) => {
        updateParams({ tab, page: '1', q: null, id: null })
    }

    const handleSearchChange = (q: string) => {
        updateParams({ q, page: '1' })
    }

    const handleIdChange = (id: string) => {
        updateParams({ id, page: '1' })
    }

    const handlePageChange = (p: number) => {
        updateParams({ page: p.toString() })
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-ink tracking-tight"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Заявки на допомогу
                    </h1>
                    <p className="text-sm text-ink-muted mt-1">
                        Переглядайте запити та долучайтесь до спільноти допомоги
                    </p>
                </div>
                <Link to="/requests/new">
                    <Button className="w-full md:w-auto shadow-md">
                        <Plus size={18} />
                        Створити заявку
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex gap-1 bg-surface-muted border border-border p-1 w-fit rounded-xl shrink-0 h-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.key
                                    ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                                    : 'text-ink-muted hover:text-ink'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => handleSearchChange(e.target.value)}
                            placeholder="Пошук за назвою..."
                            className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative w-full sm:w-48 group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            value={shortId}
                            onChange={e => handleIdChange(e.target.value)}
                            placeholder="ID (останні 6)..."
                            maxLength={6}
                            className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                        {shortId && (
                            <button 
                                onClick={() => handleIdChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="py-20">
                    <PageSpinner />
                </div>
            )}

            {error && (
                <Card className="text-center py-16 border-error/20 bg-error/5">
                    <p className="text-error font-medium">Помилка завантаження заявок</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                        Спробувати знову
                    </Button>
                </Card>
            )}

            <AnimatePresence mode="wait">
                {!loading && !error && items.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-24 bg-surface rounded-2xl border border-dashed border-border"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-muted mb-4">
                            <Inbox className="text-ink-soft" size={32} />
                        </div>
                        <p className="text-ink-muted text-lg font-medium mb-1">Заявок немає</p>
                        <p className="text-ink-soft text-sm">
                            {searchTerm || shortId 
                                ? 'За вашим запитом нічого не знайдено.'
                                : activeTab === 'open'
                                    ? 'Поки немає відкритих заявок. Станьте першим!'
                                    : 'В цій категорії поки що порожньо.'}
                        </p>
                    </motion.div>
                )}

                {!loading && items.length > 0 && (
                    <motion.div 
                        key={activeTab + page + debouncedSearch + debouncedShortId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-4"
                    >
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RequestCard item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {!loading && (hasPrev || hasNext) && (
                <div className="flex items-center justify-between mt-10">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!hasPrev}
                    >
                        <ChevronLeft size={16} />
                        Попередня
                    </Button>

                    <span className="text-sm font-medium text-ink-muted bg-surface px-3 py-1 rounded-full border border-border">
                        Сторінка {page}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!hasNext}
                    >
                        Наступна
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}
        </motion.div>
    )
}