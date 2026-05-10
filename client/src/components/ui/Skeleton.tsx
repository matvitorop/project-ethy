interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
}

export default function Skeleton({ 
    className = '', 
    variant = 'rectangular' 
}: SkeletonProps) {
    const variants = {
        text: 'h-4 w-full rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    }

    return (
        <div 
            className={`animate-pulse bg-border/50 ${variants[variant]} ${className}`} 
        />
    )
}
