import { useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { VERIFY_EMAIL } from '../../api/queries'
import type { VerifyEmailData } from '../../api/types'
import Logo from '../../components/Logo'

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
            const timer = setTimeout(() => navigate('/login'), 2000)
            return () => clearTimeout(timer)
        }
    }, [result?.success])

    if (!token) {
        return <Layout>
            <XCircle size={40} className="text-error mx-auto mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">Невалідне посилання</h1>
            <p className="text-ink-muted text-sm mb-6">Токен верифікації відсутній.</p>
            <Link to="/login" className="text-primary text-sm font-medium hover:underline">
                Повернутись до входу
            </Link>
        </Layout>
    }

    if (loading) {
        return <Layout>
            <Loader size={40} className="text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-primary mb-2">Перевірка...</h1>
            <p className="text-ink-muted text-sm">Підтверджуємо вашу електронну пошту</p>
        </Layout>
    }

    if (error || result?.error) {
        return <Layout>
            <XCircle size={40} className="text-error mx-auto mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">Помилка підтвердження</h1>
            <p className="text-ink-muted text-sm mb-2">
                {result?.error?.message ?? 'Посилання недійсне або вже використане.'}
            </p>
            <p className="text-ink-soft text-xs mb-6">
                Спробуйте надіслати лист повторно через сторінку входу.
            </p>
            <Link to="/login" className="text-primary text-sm font-medium hover:underline">
                Повернутись до входу
            </Link>
        </Layout>
    }

    if (result?.success) {
        return <Layout>
            <CheckCircle size={40} className="text-success mx-auto mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">Пошту підтверджено!</h1>
            <p className="text-ink-muted text-sm mb-6">
                Зараз вас буде перенаправлено на сторінку входу...
            </p>
        </Layout>
    }

    return null
}

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-surface-muted">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo size={48} />
                </div>
                <div className="bg-surface rounded-2xl border border-border p-8 text-center space-y-2">
                    {children}
                </div>
            </div>
        </div>
    )
}
