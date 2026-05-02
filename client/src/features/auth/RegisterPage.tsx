import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Link, useNavigate } from 'react-router-dom'
import { REGISTER } from '../../api/queries'
import type { AuthPayload } from '../../api/types'
interface RegisterData {
    auth: {
        register: AuthPayload
    }
}

interface RegisterVars {
    username: string
    email: string
    password: string
}
export default function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', email: '', password: '' })
    const [error, setError] = useState<string | null>(null)

    const [register, { loading }] = useMutation<RegisterData, RegisterVars>(REGISTER, {
        onCompleted: (data) => {
            const result = data.auth.register
            if (result.error) {
                setError(result.error.message)
            } else {
                navigate('/requests')
            }
        },
        onError: () => setError("Не вдалося з'єднатися з сервером"),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        register({ variables: form })
    }

    return (
        <div className="min-h-[calc(100vh-77px)] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Приєднуйтесь до Ethy
                    </h1>
                    <p className="text-ink-muted text-sm">
                        Створіть акаунт та починайте допомагати
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-8 space-y-5">
                    <Field
                        label="Ім'я користувача"
                        value={form.username}
                        onChange={v => setForm(f => ({ ...f, username: v }))}
                        placeholder="ivan_petrenko"
                    />
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

                    {error && (
                        <div className="px-4 py-3 bg-error/10 border border-error/30 text-error text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Зачекайте...' : 'Створити акаунт'}
                    </button>
                </form>

                <p className="text-center text-sm text-ink-muted mt-6">
                    Вже маєте акаунт?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Увійти
                    </Link>
                </p>
            </div>
        </div>
    )
}

function Field({ label, type = 'text', value, onChange, placeholder }: {
    label: string
    type?: string
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