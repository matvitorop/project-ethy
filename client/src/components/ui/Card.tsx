import { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<'div'> {
    children: ReactNode
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hoverable?: boolean
    className?: string
}

export default function Card({
    children,
    padding = 'md',
    hoverable = false,
    className = '',
    ...props
}: CardProps) {
    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }

    return (
        <motion.div
            whileHover={hoverable ? { y: -4, shadow: 'var(--shadow-lg)' } : {}}
            className={`
                bg-surface border border-border rounded-xl shadow-sm overflow-hidden
                ${hoverable ? 'transition-shadow hover:shadow-md' : ''}
                ${paddings[padding]}
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.div>
    )
}
