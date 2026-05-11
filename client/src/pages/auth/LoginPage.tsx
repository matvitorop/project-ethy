import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppDispatch } from '../../store/hooks'

import { addToast } from '../../store/uiSlice'
import { LOGIN, RESEND_VERIFICATION_EMAIL } from '../../api/queries'
import type { ResendVerificationEmailData } from '../../api/types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

interface AuthError { code: string; message: string }
interface LoginData {
    auth: { login: { token: string | null; error: AuthError | null } }
}
interface LoginVars { email: string; password: string }

export default function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [form, setForm] = useState({ email: '', password: '' })
    const [emailNotVerified, setEmailNotVerified] = useState(false)

    const [resend, { loading: resending }] = useMutation<ResendVerificationEmailData>(
        RESEND_VERIFICATION_EMAIL,
        {
            onCompleted: (data) => {
                const r = data.user.resendVerificationEmail
                if (r.error) {
                    dispatch(addToast({ type: 'error', message: r.error.message }))
                } else {
                    dispatch(addToast({ type: 'success', message: 'Лист надіслано!' }))
                    navigate('/verify-email/pending')
                }
            },
        }
    )

    const [login, { loading }] = useMutation<LoginData, LoginVars>(LOGIN, {
        refetchQueries: ['GetProfile'],
        awaitRefetchQueries: true,
        onCompleted: (data) => {
            const result = data.auth.login
            if (result.error) {
                if (result.error.code === 'Login.EMAIL_NOT_VERIFIED') {
                    setEmailNotVerified(true)
                    resend({ variables: { email: form.email } })
                } else {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                }
            } else {
                dispatch(addToast({ type: 'success', message: 'Вхід успішний!' }))
                navigate('/requests')
            }
        },
        onError: () => dispatch(addToast({
            type: 'error', message: "Не вдалося з'єднатися з сервером",
        })),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setEmailNotVerified(false)
        login({ variables: form })
    }

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>
                        З поверненням
                    </h1>
                    <p className="text-ink-soft font-bold text-xs uppercase tracking-widest">Увійдіть щоб продовжити</p>
                </div>

                {emailNotVerified && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-accent/10 border border-accent/20 rounded-2xl p-5 mb-6 flex gap-4 shadow-sm"
                    >
                        <div className="w-10 h-10 bg-accent/20 text-accent-dark rounded-xl flex items-center justify-center shrink-0">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-ink uppercase tracking-tight mb-1">Пошта не підтверджена</p>
                            <p className="text-xs text-ink-muted leading-relaxed mb-3">
                                Будь ласка, підтвердіть вашу електронну адресу. Ми вже надіслали лист.
                            </p>
                            <button
                                onClick={() => resend({ variables: { email: form.email } })}
                                disabled={resending}
                                className="text-xs font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-60"
                            >
                                {resending ? 'Надсилання...' : 'Надіслати лист ще раз'}
                            </button>
                        </div>
                    </motion.div>
                )}

                <Card padding="lg" className="shadow-2xl border-2 border-primary/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] ml-1">Email адреса</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={18} />
                                <input 
                                    type="email" 
                                    value={form.email} 
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="email@example.com" 
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-muted border border-border rounded-2xl text-ink font-bold placeholder-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] ml-1">Пароль</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={18} />
                                <input 
                                    type="password" 
                                    value={form.password} 
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••" 
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-muted border border-border rounded-2xl text-ink font-bold placeholder-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" 
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full py-4 text-sm font-black uppercase tracking-[0.1em] shadow-lg shadow-primary/20">
                            {loading ? 'Вхід...' : 'Увійти до акаунту'}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-[10px] font-black text-ink-soft uppercase tracking-widest mt-8">
                    Немає акаунту?{' '}
                    <Link to="/register" className="text-primary hover:underline ml-1">
                        Зареєструватись
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

