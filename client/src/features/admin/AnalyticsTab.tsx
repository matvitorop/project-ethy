import { Users, Shield, FileText, Flag, TrendingUp, TrendingDown } from 'lucide-react'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/Spinner'
import type { AdminAnalyticsDto } from '../../api/types'

export interface AnalyticsTabProps {
    data?: AdminAnalyticsDto | null
    loading: boolean
}

export default function AnalyticsTab({ data, loading }: AnalyticsTabProps) {
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
