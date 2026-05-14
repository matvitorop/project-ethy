import { FileText, CheckCircle, ThumbsUp, TrendingUp } from 'lucide-react'
import Card from '../../../components/ui/Card'

interface ProfileStatsCardsProps {
    totalRequests: number
    completedRequests: number
    helpedRequests: number
    rejectedRequests: number
}

export default function ProfileStatsCards({ 
    totalRequests, 
    completedRequests, 
    helpedRequests, 
    rejectedRequests 
}: ProfileStatsCardsProps) {
    
    const successRate = totalRequests > 0 
        ? Math.round((completedRequests / totalRequests) * 100) 
        : 0

    const stats = [
        {
            label: 'Створено запитів',
            value: totalRequests,
            icon: <FileText size={20} />,
            color: 'primary',
            bg: 'bg-primary/5',
            text: 'text-primary',
            iconBg: 'bg-primary/10'
        },
        {
            label: 'Виконано для мене',
            value: completedRequests,
            icon: <CheckCircle size={20} />,
            color: 'success',
            bg: 'bg-success/5',
            text: 'text-success',
            iconBg: 'bg-success/10'
        },
        {
            label: 'Допоміг іншим',
            value: helpedRequests,
            icon: <ThumbsUp size={20} />,
            color: 'info',
            bg: 'bg-info/5',
            text: 'text-info',
            iconBg: 'bg-info/10'
        },
        {
            label: 'Рейтинг успішності',
            value: `${successRate}%`,
            icon: <TrendingUp size={20} />,
            color: 'warning',
            bg: 'bg-warning/5',
            text: 'text-warning',
            iconBg: 'bg-warning/10',
            subValue: `(${rejectedRequests} відхилено)`
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} padding="md" className={`${stat.bg} border-${stat.color}/10 text-center flex flex-col items-center justify-center`}>
                        <div className={`w-10 h-10 rounded-full ${stat.iconBg} flex items-center justify-center ${stat.text} mb-2`}>
                            {stat.icon}
                        </div>
                        <p className={`text-2xl font-black ${stat.text}`}>{stat.value}</p>
                        <p className={`text-[10px] font-black ${stat.text}/70 uppercase tracking-widest`}>{stat.label}</p>
                        {stat.subValue && (
                            <p className="text-[8px] font-bold text-ink-soft opacity-60 mt-1 uppercase tracking-tighter">
                                {stat.subValue}
                            </p>
                        )}
                    </Card>
            ))}
        </div>
    )
}
