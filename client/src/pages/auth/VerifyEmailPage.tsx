import { useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, AlertCircle, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { VERIFY_EMAIL } from '../../api/queries'
import type { VerifyEmailData } from '../../api/types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [verifyEmail, { loading, data, error }] = useMutation<VerifyEmailData>(VERIFY_EMAIL)
    const result = data?.user.verifyEmail

    useEffect(() => {
        if (token) {
            verifyEmail({ variables: { token } })
        }
    }, [token])

    useEffect(() => {
        if (result?.success) {
            const timer = setTimeout(() => navigate('/login'), 2500)
            return () => clearTimeout(timer)
        }
    }, [result?.success])

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-md"
            >
                <Card padding="lg" className="text-center shadow-2xl border-2 border-primary/5">
                    {!token && (
                        <>
                            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h1 className="text-2xl font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>Помилка</h1>
                            <p className="text-ink-soft font-medium mb-8">Посилання недійсне або токен відсутній.</p>
                            <Link to="/login">
                                <Button variant="outline" className="w-full">Повернутись до входу</Button>
                            </Link>
                        </>
                    )}

                    {loading && (
                        <>
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 size={32} className="animate-spin" />
                            </div>
                            <h1 className="text-2xl font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>Перевірка</h1>
                            <p className="text-ink-soft font-medium">Підтверджуємо вашу адресу...</p>
                        </>
                    )}

                    {(error || result?.error) && (
                        <>
                            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle size={32} />
                            </div>
                            <h1 className="text-2xl font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>Не вдалося</h1>
                            <p className="text-ink-soft font-medium mb-8">
                                {result?.error?.message ?? 'Посилання застаріло або вже було використане.'}
                            </p>
                            <Link to="/login">
                                <Button variant="outline" className="w-full">Повернутись до входу</Button>
                            </Link>
                        </>
                    )}

                    {result?.success && (
                        <>
                            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} />
                            </div>
                            <h1 className="text-2xl font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>Успішно!</h1>
                            <p className="text-ink-soft font-medium mb-6">Вашу пошту підтверджено.</p>
                            <div className="text-[10px] font-black text-ink-soft uppercase tracking-widest animate-pulse">
                                Перенаправлення на вхід...
                            </div>
                        </>
                    )}
                </Card>
            </motion.div>
        </div>
    )
}
