import { ThumbsUp, ThumbsDown } from 'lucide-react'
import Card from '../../../components/ui/Card'
import UserLink from '../../../components/ui/UserLink'
import type { UserReviewItem } from '../../../api/types'

interface ProfileReviewsProps {
    reviews: UserReviewItem[]
    title?: string
}

export default function ProfileReviews({ reviews, title = "Відгуки користувачів" }: ProfileReviewsProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">{title}</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <Card key={review.id} padding="sm" className="bg-surface-muted/50 border-none shadow-sm">
                            <div className="flex gap-4">
                                <div className={`mt-1 shrink-0 ${review.isPositive ? 'text-success' : 'text-error'}`}>
                                    {review.isPositive ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <UserLink userId={review.reviewerUserId} username={review.reviewerUsername} className="text-xs font-bold" />
                                        <span className="text-[10px] font-bold text-ink-soft uppercase">
                                            {new Date(review.createdAtUtc).toLocaleDateString('uk-UA')}
                                        </span>
                                    </div>
                                    {review.comment && <p className="text-sm text-ink leading-relaxed">{review.comment}</p>}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-16 bg-surface-muted/30 rounded-3xl border border-dashed border-border">
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Відгуків ще немає</p>
                    </div>
                )}
            </div>
        </div>
    )
}
