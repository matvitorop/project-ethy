import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { removeToast } from '../store/uiSlice'

const icons = {
    success: <CheckCircle size={16} className="text-success" />,
    error: <AlertCircle size={16} className="text-error" />,
    info: <Info size={16} className="text-info" />,
}

const styles = {
    success: 'border-success/30 bg-success/10',
    error: 'border-error/30 bg-error/10',
    info: 'border-info/30 bg-info/10',
}

function ToastItem({ id, type, message }: {
    id: string
    type: 'success' | 'error' | 'info'
    message: string
}) {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const timer = setTimeout(() => dispatch(removeToast(id)), 4000)
        return () => clearTimeout(timer)
    }, [id, dispatch])

    return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${styles[type]} shadow-sm animate-slide-in`}>
            <span className="mt-0.5 flex-shrink-0">{icons[type]}</span>
            <p className="text-sm text-ink flex-1">{message}</p>
            <button
                onClick={() => dispatch(removeToast(id))}
                className="text-ink-muted hover:text-ink flex-shrink-0 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    )
}

export default function ToastContainer() {
    const toasts = useAppSelector(s => s.ui.toasts)

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
            {toasts.map(toast => (
                <ToastItem key={toast.id} {...toast} />
            ))}
        </div>
    )
}