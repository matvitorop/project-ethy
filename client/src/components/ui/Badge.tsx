import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'

interface BadgeProps {
    children: ReactNode
    variant?: BadgeVariant
    className?: string
}

export default function Badge({ 
    children, 
    variant = 'default',
    className = '' 
}: BadgeProps) {
    const variants = {
        default: 'bg-surface-muted text-ink-muted',
        success: 'bg-success/10 text-success border border-success/20',
        warning: 'bg-warning/10 text-warning border border-warning/20',
        error: 'bg-error/10 text-error border border-error/20',
        info: 'bg-info/10 text-info border border-info/20',
        outline: 'border border-border text-ink-muted',
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}
