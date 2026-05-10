import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { REGISTER } from '../../api/queries'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import type { AuthPayload } from '../../api/types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

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
    const dispatch = useAppDispatch()
    const [form, setForm] = useState({ username: '', email: '', password: '' })

    const [register, { loading }] = useMutation<RegisterData, RegisterVars>(REGISTER, {
        onCompleted: (data) => {
            const result = data.auth.register
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                sessionStorage.setItem('pendingVerificationEmail', form.email)
                dispatch(addToast({ type: 'success', message: 'Акаунт створено! Перевірте пошту.' }))
                navigate('/verify-email/pending')
            }
        },
        onError: () => dispatch(addToast({
            type: 'error',
            message: "Не вдалося з'єднатися з сервером",
        })),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        register({ variables: form })
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
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>
                        Приєднуйтесь
                    </h1>
                    <p className="text-ink-soft font-bold text-xs uppercase tracking-widest">Створіть свій акаунт Ethy</p>
                </div>

                <Card padding="lg" className="shadow-2xl border-2 border-primary/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] ml-1">Ім'я користувача</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={18} />
                                <input 
                                    type="text" 
                                    value={form.username} 
                                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                    placeholder="ivan_petrenko" 
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-muted border border-border rounded-2xl text-ink font-bold placeholder-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" 
                                />
                            </div>
                        </div>

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
                            {loading ? 'Створення...' : 'Зареєструватись'}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-[10px] font-black text-ink-soft uppercase tracking-widest mt-8">
                    Вже маєте акаунт?{' '}
                    <Link to="/login" className="text-primary hover:underline ml-1">
                        Увійти
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}