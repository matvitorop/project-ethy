import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'error' | 'success'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: ButtonVariant
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
    children?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-light shadow-sm',
        secondary: 'bg-accent text-primary hover:bg-accent-dark shadow-sm',
        outline: 'border border-border bg-transparent hover:border-primary text-ink',
        ghost: 'bg-transparent hover:bg-surface-muted text-ink-muted hover:text-ink',
        error: 'bg-error text-white hover:opacity-90 shadow-sm',
        success: 'bg-success text-white hover:opacity-90 shadow-sm',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-xs font-medium',
        md: 'px-4 py-2 text-sm font-semibold',
        lg: 'px-6 py-3 text-base font-bold',
        icon: 'p-2',
    }

    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none'

    return (
        <motion.button
            ref={ref as any}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </motion.button>
    )
})

Button.displayName = 'Button'

export default Button
