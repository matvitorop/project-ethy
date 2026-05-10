import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

interface UserLinkProps {
    userId?: string
    username: string
    showIcon?: boolean
    className?: string
}

export default function UserLink({ 
    userId, 
    username, 
    showIcon = false,
    className = '' 
}: UserLinkProps) {
    if (!userId) {
        return (
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted ${className}`}>
                {showIcon && <User size={14} />}
                {username}
            </span>
        )
    }

    return (
        <Link 
            to={`/profile/${userId}`}
            className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-primary transition-colors ${className}`}
        >
            {showIcon && <User size={14} />}
            {username}
        </Link>
    )
}
