import { useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { ArrowLeft } from 'lucide-react'
import { CREATE_HELP_REQUEST } from '../../api/queries'
import type { CreateHelpRequestData } from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import ImageUploader from '../../features/requests/components/ImageUploader'
import Modal from '../../components/Modal'
import Button from '../../components/ui/Button'
import { ShieldCheck } from 'lucide-react'

const LocationPicker = lazy(() => import('../../features/requests/components/LocationPicker'))

export default function CreateRequestPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [form, setForm] = useState({
        title: '',
        description: '',
    })
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [showModerationModal, setShowModerationModal] = useState(false)

    const [createRequest, { loading }] = useMutation<CreateHelpRequestData>(
        CREATE_HELP_REQUEST,
        {
            onCompleted: (data) => {
                const result = data.helpRequest.createHelpRequest
                if (result.error) {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                } else if (result.data) {    
                    setShowModerationModal(true)
                }
            },
            onError: () => dispatch(addToast({
                type: 'error',
                message: "Не вдалося створити заявку",
            })),
        }
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.title.trim()) {
            dispatch(addToast({ type: 'error', message: 'Вкажіть назву заявки' }))
            return
        }

        if (!form.description.trim()) {
            dispatch(addToast({ type: 'error', message: 'Вкажіть опис заявки' }))
            return
        }

        createRequest({
            variables: {
                title: form.title.trim(),
                description: form.description.trim(),
                latitude: location?.lat ?? null,
                longitude: location?.lng ?? null,
                imageUrls: imageUrls.length > 0 
                    ? imageUrls.map(url => url.split('/').pop()).filter(Boolean).slice(0, 5) 
                    : null,
            },
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Назад */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-6 transition-colors"
            >
                <ArrowLeft size={16} />
                Назад
            </button>

            <h1 className="text-2xl font-bold text-ink mb-8"
                style={{ fontFamily: 'Jua, sans-serif' }}>
                Нова заявка
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Назва */}
                <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                        Назва *
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Коротко опишіть що потрібно"
                        maxLength={200}
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                    />
                    <p className="text-xs text-ink-soft mt-1 text-right">
                        {form.title.length}/200
                    </p>
                </div>

                {/* Опис */}
                <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                        Опис *
                    </label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Детально опишіть що саме потрібно, де і коли"
                        maxLength={4000}
                        rows={5}
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary focus:bg-surface transition-colors resize-none"
                    />
                    <p className="text-xs text-ink-soft mt-1 text-right">
                        {form.description.length}/4000
                    </p>
                </div>

                {/* Фото */}
                <ImageUploader value={imageUrls} onChange={setImageUrls} />

                {/* Локація */}
                <Suspense fallback={
                    <div className="h-56 rounded-xl border border-border bg-surface-muted flex items-center justify-center">
                        <p className="text-ink-muted text-sm">Завантаження карти...</p>
                    </div>
                }>
                    <LocationPicker value={location} onChange={setLocation} />
                </Suspense>

                {/* Кнопки */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 py-3 border border-border rounded-lg text-sm font-medium text-ink hover:border-primary transition-colors"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Створення...' : 'Створити заявку'}
                    </button>
                </div>
            </form>

            <Modal 
                isOpen={showModerationModal} 
                onClose={() => navigate('/requests')} 
                title="Заявка на модерації"
            >
                <div className="space-y-6 py-4 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <ShieldCheck size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>
                            Вашу заявку прийнято на перевірку
                        </h3>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            Для забезпечення безпеки та якості на платформі, кожна нова заявка проходить модерацію. 
                            Зазвичай це займає не більше 24 годин. Після схвалення вона з'явиться в загальному списку.
                        </p>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={() => navigate('/requests')}
                    >
                        Зрозуміло
                    </Button>
                </div>
            </Modal>
        </div>
    )
}