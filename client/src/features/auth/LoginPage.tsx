import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Link, useNavigate } from 'react-router-dom'
import { LOGIN } from '../../api/queries'
import { useAppDispatch } from '../../store/hooks'
import { setAuth } from '../../store/authSlice'
import { addToast } from '../../store/uiSlice'

interface AuthError {
    code: string
    message: string
}

interface LoginData {
    auth: {
        login: {
            token: string | null
            error: AuthError | null
        }
    }
}

interface LoginVars {
    email: string
    password: string
}

export default function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [form, setForm] = useState({ email: '', password: '' })

    const [login, { loading }] = useMutation<LoginData, LoginVars>(LOGIN, {
        onCompleted: (data) => {
            const result = data.auth.login
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                // userId і username отримаємо пізніше через GET_PROFILE
                // поки зберігаємо мінімум щоб позначити що залогінений
                dispatch(setAuth({
                    userId: '',
                    username: '',
                    email: form.email,
                }))
                dispatch(addToast({ type: 'success', message: 'Вхід успішний!' }))
                navigate('/requests')
            }
        },
        onError: () => dispatch(addToast({
            type: 'error',
            message: "Не вдалося з'єднатися з сервером",
        })),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        login({ variables: form })
    }

    return (
        <div className="min-h-[calc(100vh-77px)] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        З поверненням
                    </h1>
                    <p className="text-ink-muted text-sm">
                        Увійдіть щоб продовжити допомагати
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-8 space-y-5">
                    <Field
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={v => setForm(f => ({ ...f, email: v }))}
                        placeholder="email@example.com"
                    />
                    <Field
                        label="Пароль"
                        type="password"
                        value={form.password}
                        onChange={v => setForm(f => ({ ...f, password: v }))}
                        placeholder="••••••••"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Зачекайте...' : 'Увійти'}
                    </button>
                </form>

                <p className="text-center text-sm text-ink-muted mt-6">
                    Немає акаунту?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Зареєструватись
                    </Link>
                </p>
            </div>
        </div>
    )
}

function Field({ label, type, value, onChange, placeholder }: {
    label: string
    type: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary focus:bg-surface transition-colors"
            />
        </div>
    )
}