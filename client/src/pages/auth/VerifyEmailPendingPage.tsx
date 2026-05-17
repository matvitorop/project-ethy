import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { Mail, RefreshCw, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { RESEND_VERIFICATION_EMAIL } from '../../api/queries'
import type { ResendVerificationEmailData } from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

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
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card padding="lg" className="text-center shadow-2xl border-2 border-primary/5">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Mail size={32} />
                    </div>
                    
                    <h1 className="text-3xl font-black text-ink mb-4" style={{ fontFamily: 'Jua, sans-serif' }}>
                        Підтвердіть пошту
                    </h1>
                    
                    <p className="text-ink-soft font-medium text-sm leading-relaxed mb-8 px-4">
                        Ми надіслали листа на <span className="text-ink font-bold">{email || 'вашу пошту'}</span>.
                        Будь ласка, перейдіть за посиланням у листі для активації акаунту.
                    </p>

                    <div className="bg-surface-muted rounded-2xl px-5 py-4 text-[10px] font-black text-ink-soft uppercase tracking-widest leading-loose mb-10 border border-border">
                        Посилання дійсне <span className="text-primary">24 години</span>. <br/>
                        Перевірте папку <span className="text-primary">«Спам»</span> якщо лист не прийшов.
                    </div>

                    <div className="space-y-4">
                        <Button 
                            onClick={() => resend()} 
                            disabled={loading || !email}
                            className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-md"
                        >
                            <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Надсилання...' : 'Надіслати лист ще раз'}
                        </Button>
                        
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center justify-center w-full text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] hover:text-primary transition-colors py-2"
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            Повернутись до входу
                        </button>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}