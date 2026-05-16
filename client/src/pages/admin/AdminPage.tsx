import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useApolloClient } from '@apollo/client/react'
import { Shield, FileText, Flag, BarChart2, Users, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GET_VOLUNTEER_APPLICATIONS, GET_COMPLAINTS, GET_ADMIN_HELP_REQUESTS,
    GET_ADMIN_ANALYTICS, GET_ADMIN_USERS
} from '../../api/queries'
import type {
    VolunteerApplicationsData, ComplaintsData, AdminHelpRequestsData,
    AdminAnalyticsData, AdminAnalyticsDto, AdminUsersData,
    VolunteerApplicationItem, AdminComplaintItem, AdminHelpRequestItem, AdminUserDto
} from '../../api/types'
import { useRelativeTime } from '../../hooks/useRelativeTime'
import UsersTab from '../../features/admin/UsersTab'
import AnalyticsTab from '../../features/admin/AnalyticsTab'
import ApplicationsTab from '../../features/admin/ApplicationsTab'
import ComplaintsTab from '../../features/admin/ComplaintsTab'
import RequestsTab from '../../features/admin/RequestsTab'


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
    const reqFilter = (searchParams.get('filter') as 'all' | 'moderation' | 'active' | 'completed' | 'hidden' | 'deleted' | 'cancelled' | 'inprogress') || 'all'
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
            f.statuses = ['Open']
            f.isDeleted = false
        }
        else if (reqFilter === 'inprogress') {
            f.statuses = ['InProgress']
            f.isDeleted = false
        }
        else if (reqFilter === 'completed') {
            f.statuses = ['Resolved']
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
        else if (reqFilter === 'deleted') {
            f.isDeleted = true
        }
        else if (reqFilter === 'cancelled') {
            f.statuses = ['Cancelled']
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


