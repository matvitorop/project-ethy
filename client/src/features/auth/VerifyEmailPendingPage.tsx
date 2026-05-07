import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'
import { RESEND_VERIFICATION_EMAIL } from '../../api/queries'
import type { ResendVerificationEmailData } from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import Logo from '../../components/Logo'

export default function VerifyEmailPendingPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const email = sessionStorage.getItem('pendingVerificationEmail') ?? ''

    const [resend, { loading }] = useMutation<ResendVerificationEmailData>(
        RESEND_VERIFICATION_EMAIL,
        {
            variables: { email },
            onCompleted: (data) => {
                const result = data.user.resendVerificationEmail
                if (result.error) {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                } else {
                    dispatch(addToast({ type: 'success', message: 'Лист надіслано повторно!' }))
                }
            },
            onError: () => dispatch(addToast({ type: 'error', message: 'Помилка надсилання' })),
        }
    )

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-surface-muted">
            <div className="w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <Logo size={48} />
                </div>
                <div className="bg-surface rounded-2xl border border-border p-8 space-y-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Mail size={28} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-primary mb-2"
                            style={{ fontFamily: 'Jua, sans-serif' }}>
                            Підтвердіть пошту
                        </h1>
                        <p className="text-ink-muted text-sm leading-relaxed">
                            Ми надіслали листа на <strong>{email || 'вашу пошту'}</strong>.
                            Перевірте поштову скриньку та перейдіть за посиланням.
                        </p>
                    </div>
                    <div className="bg-surface-muted rounded-lg px-4 py-3 text-xs text-ink-muted">
                        Посилання дійсне <strong>24 години</strong>. Перевірте також папку «Спам».
                    </div>
                    <button
                        onClick={() => resend()}
                        disabled={loading || !email}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm font-medium text-ink hover:border-primary hover:text-primary disabled:opacity-60 transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Надсилання...' : 'Надіслати повторно'}
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full text-sm text-ink-muted hover:text-primary transition-colors"
                    >
                        Повернутись до входу
                    </button>
                </div>
            </div>
        </div>
    )
}