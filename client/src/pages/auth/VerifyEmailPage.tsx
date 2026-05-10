import { useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { VERIFY_EMAIL } from '../../api/queries'
import type { VerifyEmailData } from '../../api/types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function VerifyEmailPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const userId = searchParams.get('userId')
    const token = searchParams.get('token')

    const [verifyEmail, { data, loading, error }] = useMutation<VerifyEmailData>(VERIFY_EMAIL)

    useEffect(() => {
        if (userId && token) {
            verifyEmail({ variables: { userId, token } })
        }
    }, [userId, token, verifyEmail])

    useEffect(() => {
        if (data?.user.verifyEmail.success) {
            const timer = setTimeout(() => {
                navigate('/login')
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [data, navigate])

    const isPending = !userId || !token

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card padding="lg" className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6"
                >
                    {isPending ? (
                        <>
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Перевірка пошти</h2>
                            <p className="text-ink-soft font-medium">Будь ласка, перейдіть за посиланням у листі, який ми вам надіслали.</p>
                            <Link to="/login" className="block">
                                <Button variant="outline" className="w-full">Повернутись до входу</Button>
                            </Link>
                        </>
                    ) : loading ? (
                        <>
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Підтвердження...</h2>
                            <p className="text-ink-soft font-medium">Ми перевіряємо ваш токен.</p>
                        </>
                    ) : error || data?.user.verifyEmail.error ? (
                        <>
                            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Помилка</h2>
                            <p className="text-error font-medium">{data?.user.verifyEmail.error?.message || 'Щось пішло не так'}</p>
                            <div className="pt-4 space-y-3">
                                <Link to="/login" className="block">
                                    <Button variant="outline" className="w-full">Спробувати увійти</Button>
                                </Link>
                                <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest flex items-center justify-center gap-2">
                                    <AlertCircle size={12} />
                                    Посилання може бути недійсним
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Успішно!</h2>
                            <p className="text-ink-soft font-medium">Вашу пошту підтверджено. Зараз ви будете перенаправлені на сторінку входу.</p>
                            <Link to="/login" className="block mt-4">
                                <Button className="w-full">Увійти зараз</Button>
                            </Link>
                        </>
                    )}
                </motion.div>
            </Card>
        </div>
    )
}
