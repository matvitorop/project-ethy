import { useState, lazy, Suspense } from 'react'
import ImageUploader from './ImageUploader'
import Button from '../../../components/ui/Button'

const LocationPicker = lazy(() => import('./LocationPicker'))

export interface RequestFormValues {
    title: string
    description: string
    location: { lat: number; lng: number } | null
    imageUrls: string[]
}

interface RequestFormProps {
    initialValues?: RequestFormValues
    onSubmit: (values: RequestFormValues) => void
    loading: boolean
    submitLabel: string
}

export default function RequestForm({ initialValues, onSubmit, loading, submitLabel }: RequestFormProps) {
    const [form, setForm] = useState({
        title: initialValues?.title || '',
        description: initialValues?.description || '',
    })
    const [imageUrls, setImageUrls] = useState<string[]>(initialValues?.imageUrls || [])
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(initialValues?.location || null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            title: form.title.trim(),
            description: form.description.trim(),
            location,
            imageUrls
        })
    }

    return (
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
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.history.back()}
                >
                    Скасувати
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? 'Обробка...' : submitLabel}
                </Button>
            </div>
        </form>
    )
}
