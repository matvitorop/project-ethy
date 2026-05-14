import { ThumbsUp, ThumbsDown } from 'lucide-react'
import Card from '../../../components/ui/Card'

interface ProfileReputationProps {
    positiveCount: number
    negativeCount: number
}

export default function ProfileReputation({ positiveCount, negativeCount }: ProfileReputationProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">Репутація</h2>
            <div className="grid grid-cols-2 gap-4">
                <Card padding="md" className="bg-success/5 border-success/10 text-center shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-2">
                        <ThumbsUp size={20} />
                    </div>
                    <p className="text-2xl font-black text-success">{positiveCount}</p>
                    <p className="text-[10px] font-black text-success/70 uppercase tracking-widest">Позитивних</p>
                </Card>
                <Card padding="md" className="bg-error/5 border-error/10 text-center shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error mx-auto mb-2">
                        <ThumbsDown size={20} />
                    </div>
                    <p className="text-2xl font-black text-error">{negativeCount}</p>
                    <p className="text-[10px] font-black text-error/70 uppercase tracking-widest">Негативних</p>
                </Card>
            </div>
        </div>
    )
}
