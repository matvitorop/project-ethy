import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import { Shield, FileText, Flag, Eye, EyeOff, BarChart2, Users, TrendingUp, TrendingDown, Calendar, RefreshCw, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GET_VOLUNTEER_APPLICATIONS, GET_COMPLAINTS, GET_ADMIN_HELP_REQUESTS,
    REVIEW_VOLUNTEER_APPLICATION, RESOLVE_COMPLAINT, HIDE_HELP_REQUEST,
    BLOCK_USER, GET_ADMIN_ANALYTICS, GET_ADMIN_USERS, UNBLOCK_USER,
    APPROVE_HELP_REQUEST, REJECT_HELP_REQUEST
} from '../../api/queries'
import type {
    VolunteerApplicationsData, ComplaintsData, AdminHelpRequestsData,
    VolunteerApplicationItem, AdminComplaintItem, AdminHelpRequestItem, ApiError, AdminAnalyticsData,
    AdminAnalyticsDto, AdminUsersData, AdminUserDto, ApproveHelpRequestData, RejectHelpRequestData
} from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import Modal from '../../components/Modal'
import { PageSpinner } from '../../components/Spinner'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import UserLink from '../../components/ui/UserLink'
import Badge from '../../components/ui/Badge'
import { useRelativeTime } from '../../hooks/useRelativeTime'

interface ResolveComplaintData {
    admin: { resolveComplaint: { success: boolean; error: ApiError | null } }
}
interface BlockUserData {
    admin: { blockUser: { success: boolean; error: ApiError | null } }
}
interface UnblockUserData {
    admin: { unblockUser: { success: boolean; error: ApiError | null } }
}
interface HideHelpRequestData {
    admin: { hideHelpRequest: { success: boolean; error: ApiError | null } }
}

function formatLastActivity(dateStr: string | null | undefined) {
    if (!dateStr) return 'немає'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'сьогодні'
    if (diffDays === 1) return 'вчора'
    if (diffDays < 7) return `${diffDays} дн. тому`
    
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}


const VOLUNTEER_STATUS_CONFIG: Record<number, { label: string; variant: string }> = {
    0: { label: 'Очікує', variant: 'warning' },
    1: { label: 'Схвалено', variant: 'success' },
    2: { label: 'Відхилено', variant: 'error' },
}

const HELP_REQUEST_STATUS_CONFIG: Record<number, { label: string; variant: string }> = {
    0: { label: 'На модерації', variant: 'info' },
    1: { label: 'Відкрита', variant: 'success' },
    2: { label: 'В процесі', variant: 'warning' },
    3: { label: 'Виконана', variant: 'default' },
    4: { label: 'Скасована', variant: 'error' },
    5: { label: 'Відхилена', variant: 'error' },
}


// ===================== REFRESH BAR =====================
function RefreshBar({ onRefresh, loading, lastUpdated }: { onRefresh: () => void; loading: boolean; lastUpdated: Date | null }) {
    const timeLabel = useRelativeTime(lastUpdated)

    return (
        <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-[10px] font-black text-ink-soft uppercase tracking-widest">
                {timeLabel ? `Оновлено: ${timeLabel}` : 'Завантаження...'}
            </span>
            <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-ink-muted hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <RefreshCw
                    size={12}
                    className={loading ? 'animate-spin' : 'transition-transform group-hover:rotate-180'}
                />
                Оновити
            </button>
        </div>
    )
}

export default function AdminPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = (searchParams.get('tab') as 'applications' | 'complaints' | 'requests' | 'analytics' | 'users') || 'analytics'
    const reqFilter = (searchParams.get('filter') as 'all' | 'moderation' | 'active' | 'completed' | 'hidden') || 'all'
    const reqSearch = searchParams.get('q') || ''

    // User search state
    const userSearch = searchParams.get('uq') || ''
    const userShortId = searchParams.get('uid') || ''

    const setActiveTab = useCallback((tab: string) => {
        setSearchParams(prev => { prev.set('tab', tab); return prev }, { replace: true })
    }, [setSearchParams])

    const setReqFilter = useCallback((f: string) => {
        setSearchParams(prev => { prev.set('filter', f); return prev }, { replace: true })
    }, [setSearchParams])

    const setReqSearch = useCallback((q: string) => {
        setSearchParams(prev => { if (q) prev.set('q', q); else prev.delete('q'); return prev }, { replace: true })
    }, [setSearchParams])

    const setUserSearch = useCallback((q: string) => {
        setSearchParams(prev => { if (q) prev.set('uq', q); else prev.delete('uq'); return prev }, { replace: true })
    }, [setSearchParams])

    const setUserShortId = useCallback((id: string) => {
        setSearchParams(prev => { if (id) prev.set('uid', id); else prev.delete('uid'); return prev }, { replace: true })
    }, [setSearchParams])

    const [lastUpdated, setLastUpdated] = useState<Record<string, Date | null>>({
        analytics: null, applications: null, complaints: null, requests: null, users: null,
    })

    const client = useApolloClient()

    const [debouncedSearch, setDebouncedSearch] = useState(reqSearch)
    const [debouncedUserSearch, setDebouncedUserSearch] = useState(userSearch)
    const [debouncedUserShortId, setDebouncedUserShortId] = useState(userShortId)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(reqSearch), 500)
        return () => clearTimeout(timer)
    }, [reqSearch])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedUserSearch(userSearch), 500)
        return () => clearTimeout(timer)
    }, [userSearch])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedUserShortId(userShortId), 500)
        return () => clearTimeout(timer)
    }, [userShortId])

    const reqVariables = useMemo(() => {
        const f: Record<string, unknown> = { page: 1, pageSize: 50, searchTerm: debouncedSearch || null }
        if (reqFilter === 'active') {
            f.statuses = ['Open', 'InProgress']
            f.isDeleted = false
        }
        else if (reqFilter === 'completed') {
            f.statuses = ['Resolved', 'Cancelled']
            f.isDeleted = false
        }
        else if (reqFilter === 'hidden') {
            f.isHidden = true
            f.isDeleted = false
        }
        else if (reqFilter === 'moderation') {
            f.statuses = ['Moderation']
            f.isDeleted = false
        }
        return { filter: f }
    }, [reqFilter, debouncedSearch])

    const { data: apps, loading: appsLoading, refetch: refetchApps } = useQuery<VolunteerApplicationsData>(GET_VOLUNTEER_APPLICATIONS)
    const { data: complaints, loading: compLoading, refetch: refetchComp } = useQuery<ComplaintsData>(GET_COMPLAINTS)
    const { data: requests, loading: reqLoading, refetch: refetchReq } = useQuery<AdminHelpRequestsData>(GET_ADMIN_HELP_REQUESTS, {
        variables: reqVariables
    })
    const { data: stats, loading: statsLoading } = useQuery<AdminAnalyticsData>(GET_ADMIN_ANALYTICS)

    const { data: users, loading: usersLoading, refetch: refetchUsers } = useQuery<AdminUsersData>(GET_ADMIN_USERS, {
        variables: {
            page: 1,
            pageSize: 50,
            searchTerm: debouncedUserSearch || null,
            shortId: debouncedUserShortId || null
        },
        skip: activeTab !== 'users'
    })

    useEffect(() => {
        if (apps && !appsLoading) {
            const t = setTimeout(() => setLastUpdated(p => ({ ...p, applications: new Date() })), 0)
            return () => clearTimeout(t)
        }
    }, [apps, appsLoading])
    useEffect(() => {
        if (complaints && !compLoading) {
            const t = setTimeout(() => setLastUpdated(p => ({ ...p, complaints: new Date() })), 0)
            return () => clearTimeout(t)
        }
    }, [complaints, compLoading])
    useEffect(() => {
        if (requests && !reqLoading) {
            const t = setTimeout(() => setLastUpdated(p => ({ ...p, requests: new Date() })), 0)
            return () => clearTimeout(t)
        }
    }, [requests, reqLoading])
    useEffect(() => {
        if (stats && !statsLoading) {
            const t = setTimeout(() => setLastUpdated(p => ({ ...p, analytics: new Date() })), 0)
            return () => clearTimeout(t)
        }
    }, [stats, statsLoading])
    useEffect(() => {
        if (users && !usersLoading) {
            const t = setTimeout(() => setLastUpdated(p => ({ ...p, users: new Date() })), 0)
            return () => clearTimeout(t)
        }
    }, [users, usersLoading])

    const TAB_QUERIES: Record<string, string[]> = {
        analytics: ['GetAdminAnalytics'],
        applications: ['GetVolunteerApplications'],
        complaints: ['GetComplaints'],
        requests: ['GetAdminHelpRequests'],
        users: ['GetAdminUsers'],
    }


    const handleRefresh = useCallback(() =>
        client.refetchQueries({ include: TAB_QUERIES[activeTab] })
        , [client, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

    const activeLoading = {
        analytics: statsLoading,
        applications: appsLoading,
        complaints: compLoading,
        requests: reqLoading,
        users: usersLoading
    }[activeTab]

    const tabs = [
        { id: 'analytics', label: 'Аналітика', icon: <BarChart2 size={18} /> },
        { id: 'applications', label: 'Волонтери', icon: <Shield size={18} /> },
        { id: 'complaints', label: 'Скарги', icon: <Flag size={18} /> },
        { id: 'requests', label: 'Заявки', icon: <FileText size={18} /> },
        { id: 'users', label: 'Користувачі', icon: <Users size={18} /> },
    ]

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Адмін-панель</h1>
                    <p className="text-xs font-bold text-ink-soft uppercase tracking-widest mt-1">Керування платформою Ethy</p>
                </div>
            </div>

            {/* Таби */}
            <div className="flex flex-wrap gap-2 mb-4 bg-surface-muted/50 p-1.5 rounded-2xl border border-border/50">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'applications' | 'complaints' | 'requests' | 'analytics' | 'users')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                            : 'text-ink-soft hover:text-ink hover:bg-surface'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <RefreshBar
                onRefresh={handleRefresh}
                loading={activeLoading}
                lastUpdated={lastUpdated[activeTab]}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'analytics' && <AnalyticsTab data={stats?.statsQuery.adminAnalytics.data as AdminAnalyticsDto} loading={statsLoading} />}
                    {activeTab === 'applications' && <ApplicationsTab items={(apps?.adminQuery.volunteerApplications.items || []) as VolunteerApplicationItem[]} loading={appsLoading} onRefresh={refetchApps} />}
                    {activeTab === 'complaints' && <ComplaintsTab items={(complaints?.adminQuery.complaints.items || []) as AdminComplaintItem[]} loading={compLoading} onRefresh={refetchComp} />}
                    {activeTab === 'requests' && (
                        <RequestsTab
                            items={(requests?.adminQuery.helpRequests.items || []) as AdminHelpRequestItem[]}
                            loading={reqLoading}
                            onRefresh={refetchReq}
                            filter={reqFilter}
                            onFilterChange={setReqFilter}
                            search={reqSearch}
                            onSearchChange={setReqSearch}
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersTab
                            items={(users?.adminQuery.users.items || []) as AdminUserDto[]}
                            loading={usersLoading}
                            onRefresh={refetchUsers}
                            search={userSearch}
                            onSearchChange={setUserSearch}
                            shortId={userShortId}
                            onShortIdChange={setUserShortId}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// ... AnalyticsTab, ApplicationsTab, ComplaintsTab, RequestsTab ...

// ===================== USERS TAB =====================
interface UsersTabProps {
    items: AdminUserDto[]
    loading: boolean
    onRefresh: () => void
    search: string
    onSearchChange: (s: string) => void
    shortId: string
    onShortIdChange: (id: string) => void
}

function UsersTab({ items, loading, onRefresh, search, onSearchChange, shortId, onShortIdChange }: UsersTabProps) {
    const dispatch = useAppDispatch()
    const [blockModal, setBlockModal] = useState<{ userId: string; username: string } | null>(null)
    const [blockForm, setBlockForm] = useState({ reason: '', hours: '24' })

    const [unblock] = useMutation<UnblockUserData>(UNBLOCK_USER, {
        onCompleted: (data) => {
            const r = data.admin.unblockUser
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Користувача розблоковано' })); onRefresh() }
        },
    })

    const [block, { loading: blocking }] = useMutation<BlockUserData>(BLOCK_USER, {
        onCompleted: (data) => {
            const r = data.admin.blockUser
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Користувача заблоковано' }))
                setBlockModal(null)
                setBlockForm({ reason: '', hours: '24' })
                onRefresh()
            }
        },
    })

    const BLOCK_PRESETS = [
        { label: '1 д', hours: 24 }, { label: '3 д', hours: 72 },
        { label: '7 д', hours: 168 }, { label: '30 д', hours: 720 },
        { label: '∞', hours: 0 },
    ]

    const ROLE_LABELS: Record<number, string> = { 0: 'Адмін', 1: 'Користувач', 2: 'Волонтер' }

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id.slice(-6))
        dispatch(addToast({ type: 'success', message: 'ID скопійовано' }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-muted/30 p-4 rounded-3xl border border-border/50">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => onSearchChange(e.target.value)}
                            placeholder="Пошук за ім'ям або email..."
                            className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                        {search && (
                            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative w-full sm:w-48 group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-bold text-xs">#</span>
                        <input
                            type="text"
                            value={shortId}
                            onChange={e => onShortIdChange(e.target.value)}
                            placeholder="ID (6 знаків)"
                            maxLength={6}
                            className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                        {shortId && (
                            <button onClick={() => onShortIdChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <PageSpinner />
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                        <Users size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                        <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Користувачів не знайдено</p>
                    </div>
                ) : (
                    items.map((u: AdminUserDto) => (
                        <Card key={u.id} padding="sm" className={u.isDeleted ? 'opacity-50 grayscale' : ''}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <UserLink userId={u.id} username={u.username} className="font-bold text-ink text-base hover:text-primary transition-colors" />
                                        <Badge variant={u.role === 0 ? 'error' : u.role === 2 ? 'success' : 'default'}>
                                            {ROLE_LABELS[u.role]}
                                        </Badge>
                                        {u.isBlocked && <Badge variant="error">Заблокований</Badge>}
                                        {u.isDeleted && <Badge variant="outline">Видалений</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                        <span>{u.email}</span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <button
                                            onClick={() => handleCopyId(u.id)}
                                            className="hover:text-primary transition-colors"
                                            title="Копіювати повний ID"
                                        >
                                            ID: ...{u.id.slice(-6)}
                                        </button>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span>Реєстрація: {new Date(u.registeredAtUtc).toLocaleDateString('uk-UA')}</span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span className={u.lastActivityAtUtc && (new Date().getTime() - new Date(u.lastActivityAtUtc).getTime()) < 10 * 60 * 1000 ? 'text-success' : ''}>
                                            Активність: {formatLastActivity(u.lastActivityAtUtc)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!u.isDeleted && (
                                        u.isBlocked ? (
                                            <Button variant="success" size="sm" onClick={() => unblock({ variables: { targetUserId: u.id } })}>
                                                Розблокувати
                                            </Button>
                                        ) : (
                                            <Button variant="error" size="sm" onClick={() => setBlockModal({ userId: u.id, username: u.username })}>
                                                Заблокувати
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal isOpen={!!blockModal} onClose={() => setBlockModal(null)} title={`Блокування: ${blockModal?.username}`}>
                <div className="space-y-6 p-2">
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Тривалість</label>
                        <div className="flex flex-wrap gap-2">
                            {BLOCK_PRESETS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => setBlockForm({ ...blockForm, hours: p.hours.toString() })}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${blockForm.hours === p.hours.toString()
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-surface-muted text-ink-soft hover:bg-surface border border-border'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Причина</label>
                        <input
                            type="text"
                            value={blockForm.reason}
                            onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                            placeholder="Вкажіть причину..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setBlockModal(null)}>Скасувати</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            disabled={blocking || !blockForm.reason}
                            onClick={() => {
                                const until = blockForm.hours === '0' ? null : new Date(Date.now() + parseInt(blockForm.hours) * 60 * 60 * 1000).toISOString()
                                block({ variables: { targetUserId: blockModal!.userId, reason: blockForm.reason, blockedUntilUtc: until } })
                            }}
                        >
                            {blocking ? 'Блокування...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ===================== ANALYTICS TAB =====================
function AnalyticsTab({ data, loading }: { data?: AdminAnalyticsDto | null; loading: boolean }) {
    if (loading) return <PageSpinner />
    if (!data) return null

    const stats = [
        { label: 'Користувачів', value: data.totalUsers, icon: <Users />, color: 'bg-primary/10 text-primary', trend: '+12%', up: true },
        { label: 'Волонтерів', value: data.totalVolunteers, icon: <Shield />, color: 'bg-success/10 text-success', trend: '+5%', up: true },
        { label: 'Нових запитів', value: data.newRequestsThisWeek, icon: <FileText />, color: 'bg-info/10 text-info', trend: '+15%', up: true },
        { label: 'Скарг', value: data.totalComplaints, icon: <Flag />, color: 'bg-error/10 text-error', trend: '+1', up: false },
    ]

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <Card key={i} padding="md" className="relative overflow-hidden group hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                {s.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${s.up ? 'text-success' : 'text-error'}`}>
                                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {s.trend}
                            </div>
                        </div>
                        <p className="text-3xl font-black text-ink mb-1">{s.value}</p>
                        <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest">{s.label}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card padding="lg">
                    <h3 className="text-lg font-black text-ink mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Активність платформи
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-surface-muted/30 rounded-3xl border border-dashed border-border">
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Графік активності (TBD)</p>
                    </div>
                </Card>
                <Card padding="lg">
                    <h3 className="text-lg font-black text-ink mb-6 flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Нові реєстрації
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-surface-muted/30 rounded-3xl border border-dashed border-border">
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Графік реєстрацій (TBD)</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}

// ===================== APPLICATIONS TAB =====================
function ApplicationsTab({ items, loading, onRefresh }: { items: VolunteerApplicationItem[]; loading: boolean; onRefresh: () => void }) {
    const dispatch = useAppDispatch()
    const [reviewModal, setReviewModal] = useState<{ id: string; approve: boolean } | null>(null)
    const [comment, setComment] = useState('')
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const getImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('/uploads')) return `http://localhost:5274${url}`;
        return `http://localhost:5274/uploads/volunteer-documents/${url}`;
    }

    const [review, { loading: reviewing }] = useMutation<{ admin: { reviewVolunteerApplication: { success: boolean; error: ApiError | null } } }>(REVIEW_VOLUNTEER_APPLICATION, {
        onCompleted: (data) => {
            const r = data?.admin.reviewVolunteerApplication
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Заявку розглянуто' }))
                setReviewModal(null)
                setComment('')
                onRefresh()
            }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                    <Shield size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Нових заявок немає</p>
                </div>
            )}
            {items.map((app: VolunteerApplicationItem) => (
                <Card key={app.id} padding="md" className="hover:border-primary/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-ink-soft shrink-0 shadow-inner overflow-hidden border border-border">
                                {app.documentImageUrl ? (
                                    <img 
                                        src={getImageUrl(app.documentImageUrl)!} 
                                        alt="Document" 
                                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => setPreviewImage(app.documentImageUrl!)}
                                    />
                                ) : (
                                    <FileText size={24} />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <UserLink userId={app.userId} username={app.username} className="font-black text-xl text-ink leading-none hover:text-primary transition-colors" />
                                    <Badge variant={(VOLUNTEER_STATUS_CONFIG[app.status]?.variant as 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline') || 'default'}>
                                        {VOLUNTEER_STATUS_CONFIG[app.status]?.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {new Date(app.submittedAtUtc).toLocaleDateString('uk-UA')}
                                    </span>
                                    {app.organizationName && (
                                        <>
                                            <span className="w-1 h-1 bg-border rounded-full" />
                                            <span>{app.organizationName}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {app.status === 0 && (
                                <div className="flex gap-2 ml-4 pl-4 border-l border-border">
                                    <Button variant="success" size="sm" onClick={() => setReviewModal({ id: app.id, approve: true })}>
                                        Схвалити
                                    </Button>
                                    <Button variant="error" size="sm" onClick={() => setReviewModal({ id: app.id, approve: false })}>
                                        Відхилити
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {app.status === 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Опис діяльності</p>
                                    <div className="bg-surface-muted/50 p-4 rounded-2xl border border-border/50 italic text-sm text-ink-muted leading-relaxed">
                                        "{app.activityDescription || 'Без коментаря'}"
                                    </div>
                                    {app.adminComment && (
                                        <div className="mt-4 p-4 bg-error/5 border border-error/10 rounded-2xl">
                                            <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1">Коментар адміна</p>
                                            <p className="text-sm text-error font-medium">{app.adminComment}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            ))}

            <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setComment('') }}
                title={reviewModal?.approve ? 'Схвалити заявку' : 'Відхилити заявку'}>
                <div className="space-y-5 p-2">
                    <p className="text-sm text-ink-muted">
                        {reviewModal?.approve
                            ? 'Ви збираєтесь надати користувачу статус волонтера. Він зможе брати завдання в роботу.'
                            : 'Ви відхиляєте заявку. Бажано вказати причину.'}
                    </p>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        placeholder="Коментар для користувача..."
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => { setReviewModal(null); setComment('') }}>
                            Скасувати
                        </Button>
                        <Button
                            onClick={() => review({ variables: { applicationId: reviewModal!.id, approve: reviewModal!.approve, comment: comment || null } })}
                            disabled={reviewing}
                            variant={reviewModal?.approve ? 'success' : 'error'}
                            className="flex-1"
                        >
                            {reviewing ? 'Обробка...' : reviewModal?.approve ? 'Підтвердити' : 'Відхилити'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Image Preview Modal */}
            <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Перегляд документа" maxWidth="max-w-4xl">
                <div className="p-1 flex justify-center bg-surface-muted/30 rounded-2xl overflow-hidden border border-border">
                    <img 
                        src={getImageUrl(previewImage)!} 
                        alt="Document Large" 
                        className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-xl"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setPreviewImage(null)}>Закрити</Button>
                </div>
            </Modal>
        </div>
    )
}

// ===================== COMPLAINTS TAB =====================
function ComplaintsTab({ items, loading, onRefresh }: { items: AdminComplaintItem[]; loading: boolean; onRefresh: () => void }) {
    const dispatch = useAppDispatch()
    const [blockModal, setBlockModal] = useState<{ userId: string; username: string; complaintId?: string } | null>(null)
    const [resolveModal, setResolveModal] = useState<string | null>(null)
    const [comment, setComment] = useState('')
    const [blockForm, setBlockForm] = useState({ reason: '', hours: '24' })

    const BLOCK_PRESETS = [
        { label: '1 д', hours: 24 }, { label: '3 д', hours: 72 },
        { label: '7 д', hours: 168 }, { label: '30 д', hours: 720 },
        { label: '∞', hours: 0 },
    ]

    const [resolve, { loading: resolving }] = useMutation<ResolveComplaintData>(RESOLVE_COMPLAINT, {
        onCompleted: (data) => {
            const r = data.admin.resolveComplaint
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Скаргу розглянуто' }))
                setResolveModal(null)
                setComment('')
                onRefresh()
            }
        },
    })

    const [blockUser, { loading: blocking }] = useMutation<BlockUserData>(BLOCK_USER, {
        onCompleted: async (data) => {
            const r = data.admin.blockUser
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Користувача заблоковано' }))

                // Якщо блокування було через скаргу - резолвимо її
                if (blockModal?.complaintId) {
                    resolve({
                        variables: {
                            complaintId: blockModal.complaintId,
                            adminComment: `Користувача заблоковано: ${blockForm.reason}`
                        }
                    })
                }

                setBlockModal(null)
            }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                    <Flag size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Скарг немає</p>
                </div>
            )}
            {items.map((c: AdminComplaintItem) => (
                <Card key={c.id} padding="md" className={c.isResolved ? 'opacity-60 grayscale-[0.5]' : ''}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0">
                                    <Flag size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ink">
                                        Скарга на <UserLink userId={c.targetUserId} username={c.targetUsername} className="text-primary" />
                                    </p>
                                    <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                        Від: <UserLink userId={c.reporterUserId} username={c.reporterUsername} /> • {new Date(c.createdAtUtc).toLocaleDateString('uk-UA')}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-surface-muted/50 p-4 rounded-2xl border border-border/50 text-sm text-ink leading-relaxed">
                                {c.reason}
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2">
                            {!c.isResolved && (
                                <>
                                    <Button size="sm" onClick={() => setResolveModal(c.id)}>Розглянуто</Button>
                                    <Button variant="error" size="sm" onClick={() => setBlockModal({ userId: c.targetUserId, username: c.targetUsername, complaintId: c.id })}>Заблокувати</Button>
                                </>
                            )}
                            {c.isResolved && <Badge variant="outline">Розглянуто</Badge>}
                        </div>
                    </div>
                </Card>
            ))}

            <Modal isOpen={!!blockModal} onClose={() => setBlockModal(null)} title={`Блокування: ${blockModal?.username}`}>
                <div className="space-y-6 p-2">
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Тривалість</label>
                        <div className="flex flex-wrap gap-2">
                            {BLOCK_PRESETS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => setBlockForm({ ...blockForm, hours: p.hours.toString() })}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${blockForm.hours === p.hours.toString()
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-surface-muted text-ink-soft hover:bg-surface border border-border'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Причина (публічна)</label>
                        <input
                            type="text"
                            value={blockForm.reason}
                            onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                            placeholder="Напр: Порушення правил спілкування"
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setBlockModal(null)}>Скасувати</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            disabled={blocking || !blockForm.reason}
                            onClick={() => {
                                const until = blockForm.hours === '0' ? null : new Date(Date.now() + parseInt(blockForm.hours) * 60 * 60 * 1000).toISOString()
                                blockUser({
                                    variables: {
                                        targetUserId: blockModal!.userId,
                                        reason: blockForm.reason,
                                        blockedUntilUtc: until
                                    }
                                })
                            }}
                        >
                            {blocking ? 'Блокування...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!resolveModal} onClose={() => { setResolveModal(null); setComment(''); }} title="Розгляд скарги">
                <div className="space-y-5 p-2">
                    <p className="text-sm text-ink-muted">
                        Вкажіть коментар щодо розгляду скарги. Користувач, який залишив скаргу, отримає сповіщення.
                    </p>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        placeholder="Ваша відповідь (необов'язково)..."
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none"
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => { setResolveModal(null); setComment(''); }}>
                            Скасувати
                        </Button>
                        <Button
                            onClick={() => resolve({ variables: { complaintId: resolveModal!, adminComment: comment || null } })}
                            disabled={resolving}
                            className="flex-1 shadow-md"
                        >
                            {resolving ? 'Обробка...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ===================== REQUESTS TAB =====================
interface RequestsTabProps {
    items: AdminHelpRequestItem[]
    loading: boolean
    onRefresh: () => void
    filter: 'all' | 'moderation' | 'active' | 'completed' | 'hidden'
    onFilterChange: (f: 'all' | 'moderation' | 'active' | 'completed' | 'hidden') => void
    search: string
    onSearchChange: (s: string) => void
}

function RequestsTab({ items, loading, onRefresh, filter, onFilterChange, search, onSearchChange }: RequestsTabProps) {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const [approveReq] = useMutation<ApproveHelpRequestData>(APPROVE_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.approveHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Заявку схвалено' })); onRefresh() }
        }
    })

    const [rejectReq, { loading: rejecting }] = useMutation<RejectHelpRequestData>(REJECT_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.rejectHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Заявку відхилено' }))
                setRejectModal(null)
                setRejectReason('')
                onRefresh()
            }
        }
    })

    const [hideReq] = useMutation<HideHelpRequestData>(HIDE_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.hideHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Статус змінено' })); onRefresh() }
        },
    })

    const filterOptions: { id: typeof filter; label: string }[] = [
        { id: 'all', label: 'Всі' },
        { id: 'moderation', label: 'На модерації' },
        { id: 'active', label: 'Активні' },
        { id: 'completed', label: 'Завершені' },
        { id: 'hidden', label: 'Приховані' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-muted/30 p-4 rounded-3xl border border-border/50">
                <div className="flex flex-wrap gap-1.5 p-1 bg-surface-muted rounded-2xl border border-border/50">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => onFilterChange(opt.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === opt.id
                                ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                                : 'text-ink-soft hover:text-ink hover:bg-surface'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Пошук за назвою..."
                        className="w-full pl-11 pr-10 py-3 bg-surface border border-border rounded-2xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <PageSpinner />
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                        <FileText size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                        <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">
                            {search ? 'За вашим запитом нічого не знайдено' : 'Запитів немає'}
                        </p>
                    </div>
                ) : (
                    items.map((hr: AdminHelpRequestItem) => (
                        <Card key={hr.id} padding="sm" className={hr.isHidden ? 'opacity-60 grayscale-[0.5]' : ''}>
                            <div className="flex items-center justify-between gap-4">
                                <div
                                    className="min-w-0 flex-1 cursor-pointer group/item"
                                    onClick={() => navigate(`/requests/${hr.id}`)}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-ink truncate text-base group-hover/item:text-primary transition-colors">{hr.title}</span>
                                        {hr.isHidden && <Badge variant="error">Приховано</Badge>}
                                        {hr.isDeleted && <Badge variant="error" className="bg-error text-black font-black">Видалено</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                        <span className="text-primary font-bold">{hr.creatorUsername}</span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <Badge variant={(HELP_REQUEST_STATUS_CONFIG[hr.status]?.variant as 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline') || 'default'}>
                                            {HELP_REQUEST_STATUS_CONFIG[hr.status]?.label}
                                        </Badge>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span>{new Date(hr.createdAtUtc).toLocaleDateString('uk-UA')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {hr.status === 0 && (
                                        <div className="flex gap-2 mr-2 pr-4 border-r border-border">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    approveReq({ variables: { helpRequestId: hr.id } });
                                                }}
                                            >
                                                Схвалити
                                            </Button>
                                            <Button
                                                variant="error"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRejectModal({ id: hr.id, title: hr.title });
                                                }}
                                            >
                                                Відхилити
                                            </Button>
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            hideReq({ variables: { helpRequestId: hr.id, hide: !hr.isHidden } });
                                        }}
                                    >
                                        {hr.isHidden ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                                        {hr.isHidden ? 'Показати' : 'Приховати'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal
                isOpen={!!rejectModal}
                onClose={() => { setRejectModal(null); setRejectReason(''); }}
                title="Відхилити заявку"
            >
                <div className="space-y-6 p-2">
                    <div className="bg-error/5 p-4 rounded-2xl border border-error/10">
                        <p className="text-sm font-bold text-ink mb-1">Ви відхиляєте заявку:</p>
                        <p className="text-xs text-ink-soft italic">"{rejectModal?.title}"</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Причина відхилення (буде надіслана автору)</label>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Напр: Недостовірна інформація, нецензурна лексика тощо..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none"
                            rows={4}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setRejectModal(null)}>Скасувати</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            disabled={rejecting || !rejectReason.trim()}
                            onClick={() => rejectReq({ variables: { helpRequestId: rejectModal!.id, reason: rejectReason } })}
                        >
                            {rejecting ? 'Обробка...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
