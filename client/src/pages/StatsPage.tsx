import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { GET_PLATFORM_STATS, GET_MONTHLY_ACTIVITY, GET_TOP_VOLUNTEERS } from '../api/queries'
import type { PlatformStatsData, MonthlyActivityData, TopVolunteersData } from '../api/types'
import { PageSpinner } from '../components/Spinner'

const MONTH_NAMES = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру']

const STATUS_COLORS = {
    'Відкриті': '#3B82F6',
    'В процесі': '#FEC130',
    'Виконані': '#22C55E',
    'Скасовані': '#EF4444',
    'Чернетки': '#94A3B8',
}

export default function StatsPage() {
    const { data: statsData, loading: statsLoading } =
        useQuery<PlatformStatsData>(GET_PLATFORM_STATS, { fetchPolicy: 'cache-and-network' })

    const { data: monthlyData, loading: monthlyLoading } =
        useQuery<MonthlyActivityData>(GET_MONTHLY_ACTIVITY, { fetchPolicy: 'cache-and-network' })

    const { data: topData, loading: topLoading } =
        useQuery<TopVolunteersData>(GET_TOP_VOLUNTEERS, {
            variables: { limit: 5 },
            fetchPolicy: 'cache-and-network',
        })

    if (statsLoading && monthlyLoading) return <PageSpinner />

    const stats = statsData?.statsQuery.platformStats.stats
    const monthly = monthlyData?.statsQuery.monthlyActivity.items ?? []
    const top = topData?.statsQuery.topVolunteers.data

    const pieData = stats ? [
        { name: 'Відкриті', value: stats.openRequests },
        { name: 'В процесі', value: stats.inProgressRequests },
        { name: 'Виконані', value: stats.resolvedRequests },
        { name: 'Скасовані', value: stats.cancelledRequests },
        { name: 'Чернетки', value: stats.draftRequests },
    ].filter(d => d.value > 0) : []

    const chartData = monthly.map(m => ({
        name: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
        count: m.count,
    }))

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Заголовок */}
            <div>
                <h1 className="text-2xl font-bold text-primary mb-1"
                    style={{ fontFamily: 'Jua, sans-serif' }}>
                    Статистика платформи
                </h1>
                <p className="text-sm text-ink-muted">
                    Дані оновлюються кожні 10 хвилин
                </p>
            </div>

            {/* Ключові показники */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Всього заявок" value={stats.totalRequests} color="text-primary" />
                    <StatCard label="Виконано" value={stats.resolvedRequests} color="text-success" />
                    <StatCard label="Користувачів" value={stats.totalUsers} color="text-info" />
                    <StatCard label="Волонтерів" value={stats.totalVolunteers} color="text-accent-dark" />
                </div>
            )}

            {/* Метрики ефективності */}
            {stats && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface rounded-xl border border-border p-5 text-center">
                        <p className="text-3xl font-bold text-success mb-1">
                            {stats.completionRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-ink-muted">Відсоток виконаних заявок</p>
                    </div>
                    <div className="bg-surface rounded-xl border border-border p-5 text-center">
                        <p className="text-3xl font-bold text-primary mb-1">
                            {stats.avgCompletionDays.toFixed(1)}
                        </p>
                        <p className="text-sm text-ink-muted">Середній час виконання (днів)</p>
                    </div>
                </div>
            )}

            {/* Графіки */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Pie — розбивка по статусах */}
                <div className="bg-surface rounded-xl border border-border p-6">
                    <h2 className="text-base font-semibold text-ink mb-4"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Заявки по статусах
                    </h2>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }>
                                    {pieData.map(entry => (
                                        <Cell key={entry.name}
                                            fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] ?? '#94A3B8'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} заявок`]} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-ink-muted text-sm">
                            Немає даних
                        </div>
                    )}
                </div>

                {/* Area — активність по місяцях */}
                <div className="bg-surface rounded-xl border border-border p-6">
                    <h2 className="text-base font-semibold text-ink mb-4"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Активність (останні 12 місяців)
                    </h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0B1D3A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0B1D3A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                <Tooltip formatter={(value) => [`${value} заявок`]} />
                                <Area type="monotone" dataKey="count" name="Заявок"
                                    stroke="#0B1D3A" fill="url(#colorCount)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-ink-muted text-sm">
                            Немає даних
                        </div>
                    )}
                </div>
            </div>

            {/* Топ волонтерів */}
            {!topLoading && top && (
                <div className="grid md:grid-cols-2 gap-6">
                    <TopTable
                        title="Топ за виконаними заявками"
                        rows={top.byCompleted.map((v, i) => ({
                            rank: i + 1,
                            userId: v.userId,
                            username: v.username,
                            value: v.completedCount,
                            label: 'виконано',
                        }))}
                    />
                    <TopTable
                        title="Топ за позитивними відгуками"
                        rows={top.byReviews.map((v, i) => ({
                            rank: i + 1,
                            userId: v.userId,
                            username: v.username,
                            value: v.positiveReviews,
                            label: '👍',
                        }))}
                    />
                </div>
            )}
        </div>
    )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-surface rounded-xl border border-border p-5 text-center">
            <p className={`text-3xl font-bold mb-1 ${color}`}>{value.toLocaleString('uk-UA')}</p>
            <p className="text-xs text-ink-muted">{label}</p>
        </div>
    )
}

function TopTable({ title, rows }: {
    title: string
    rows: { rank: number; userId: string; username: string; value: number; label: string }[]
}) {
    return (
        <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-ink mb-4"
                style={{ fontFamily: 'Jua, sans-serif' }}>
                {title}
            </h2>
            {rows.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-4">Немає даних</p>
            ) : (
                <div className="space-y-2">
                    {rows.map(row => (
                        <div key={row.userId}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-muted transition-colors">
                            <span className={`w-6 text-center text-sm font-bold ${row.rank === 1 ? 'text-accent-dark' :
                                    row.rank === 2 ? 'text-ink-muted' :
                                        row.rank === 3 ? 'text-amber-600' : 'text-ink-soft'
                                }`}>
                                {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : row.rank}
                            </span>
                            <Link to={`/profile/${row.userId}`}
                                className="flex-1 text-sm font-medium text-ink hover:text-primary transition-colors">
                                {row.username}
                            </Link>
                            <span className="text-sm text-ink-muted">
                                {row.value} {row.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
