import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { GET_PLATFORM_STATS, GET_MONTHLY_ACTIVITY, GET_TOP_VOLUNTEERS } from '../api/queries'
import type { PlatformStatsData, MonthlyActivityData, TopVolunteersData } from '../api/types'
import { PageSpinner } from '../components/Spinner'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import UserLink from '../components/ui/UserLink'

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
        { name: 'Відкриті', value: stats.openRequests, color: STATUS_COLORS['Відкриті'] },
        { name: 'В процесі', value: stats.inProgressRequests, color: STATUS_COLORS['В процесі'] },
        { name: 'Виконані', value: stats.resolvedRequests, color: STATUS_COLORS['Виконані'] },
        { name: 'Скасовані', value: stats.cancelledRequests, color: STATUS_COLORS['Скасовані'] },
        { name: 'Чернетки', value: stats.draftRequests, color: STATUS_COLORS['Чернетки'] },
    ].filter(d => d.value > 0) : []

    const chartData = monthly.map(m => ({
        name: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
        count: m.count,
    }))

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {/* Заголовок */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-primary mb-2"
                    style={{ fontFamily: 'Jua, sans-serif' }}>
                    Статистика платформи
                </h1>
                <p className="text-sm text-ink-muted">
                    Глобальна активність спільноти Project Ethy
                </p>
            </motion.div>

            {/* Ключові показники */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Всього заявок" value={stats.totalRequests} color="text-primary" delay={0.1} />
                    <StatCard label="Виконано" value={stats.resolvedRequests} color="text-success" delay={0.2} />
                    <StatCard label="Користувачів" value={stats.totalUsers} color="text-info" delay={0.3} />
                    <StatCard label="Волонтерів" value={stats.totalVolunteers} color="text-accent-dark" delay={0.4} />
                </div>
            )}

            {/* Метрики ефективності */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card padding="md" className="flex flex-col items-center justify-center text-center">
                        <p className="text-4xl font-black text-success mb-2 tracking-tight">
                            {stats.completionRate.toFixed(1)}%
                        </p>
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Відсоток успіху</p>
                    </Card>
                    <Card padding="md" className="flex flex-col items-center justify-center text-center">
                        <p className="text-4xl font-black text-primary mb-2 tracking-tight">
                            {stats.avgCompletionDays.toFixed(1)}
                        </p>
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Днів на заявку (сер.)</p>
                    </Card>
                </div>
            )}

            {/* Графіки */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Pie — розбивка по статусах */}
                <Card padding="lg">
                    <h2 className="text-lg font-bold text-ink mb-6"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Розподіл за статусами
                    </h2>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} заявок`]} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-ink-soft text-sm">
                            Дані відсутні
                        </div>
                    )}
                </Card>

                {/* Area — активність по місяцях */}
                <Card padding="lg">
                    <h2 className="text-lg font-bold text-ink mb-6"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Динаміка за рік
                    </h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0B1D3A" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0B1D3A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink-soft)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink-soft)' }} allowDecimals={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} заявок`]} 
                                />
                                <Area type="monotone" dataKey="count" name="Заявок"
                                    stroke="#0B1D3A" fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-ink-soft text-sm">
                            Дані відсутні
                        </div>
                    )}
                </Card>
            </div>

            {/* Топ волонтерів */}
            {!topLoading && top && (
                <div className="grid md:grid-cols-2 gap-8">
                    <TopTable
                        title="Герої за виконанням"
                        rows={top.byCompleted.map((v, i) => ({
                            rank: i + 1,
                            userId: v.userId,
                            username: v.username,
                            value: v.completedCount,
                            label: 'виконано',
                        }))}
                    />
                    <TopTable
                        title="Улюбленці спільноти"
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

function StatCard({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
        >
            <Card padding="md" className="text-center h-full">
                <p className={`text-3xl font-black mb-1 ${color}`}>{value.toLocaleString('uk-UA')}</p>
                <p className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">{label}</p>
            </Card>
        </motion.div>
    )
}

function TopTable({ title, rows }: {
    title: string
    rows: { rank: number; userId: string; username: string; value: number; label: string }[]
}) {
    return (
        <Card padding="lg">
            <h2 className="text-lg font-bold text-ink mb-6"
                style={{ fontFamily: 'Jua, sans-serif' }}>
                {title}
            </h2>
            {rows.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-8">Дані завантажуються...</p>
            ) : (
                <div className="space-y-1">
                    {rows.map((row, index) => (
                        <motion.div 
                            key={row.userId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-muted transition-colors group"
                        >
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-black ${
                                    row.rank === 1 ? 'bg-accent/20 text-accent-dark' :
                                    row.rank === 2 ? 'bg-slate-100 text-slate-500' :
                                    row.rank === 3 ? 'bg-amber-50 text-amber-700' : 
                                    'text-ink-soft'
                                }`}>
                                {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : row.rank}
                            </span>
                            <div className="flex-1">
                                <UserLink userId={row.userId} username={row.username} className="font-bold text-ink" />
                            </div>
                            <Badge variant={row.rank === 1 ? 'success' : 'default'} className="font-black">
                                {row.value} {row.label}
                            </Badge>
                        </motion.div>
                    ))}
                </div>
            )}
        </Card>
    )
}
