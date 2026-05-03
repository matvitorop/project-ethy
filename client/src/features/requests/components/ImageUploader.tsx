import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { useAppDispatch } from '../../../store/hooks'
import { addToast } from '../../../store/uiSlice'

const API_BASE_URL = 'http://localhost:5274'
const MAX_IMAGES = 5

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const dispatch = useAppDispatch()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remaining = MAX_IMAGES - value.length
    if (remaining <= 0) {
      dispatch(addToast({ type: 'error', message: `Максимум ${MAX_IMAGES} зображень` }))
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)

    try {
      const urls: string[] = []

      for (const file of toUpload) {
        const formData = new FormData()
          formData.append('files', file, file.name)

        const res = await fetch(`${API_BASE_URL}/api/files/help-requests`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

          const data = await res.json()
          const fullUrls = data.imageUrls.map((url: string) => `/uploads/temp/${url}`)
          urls.push(...fullUrls)
      }

      onChange([...value, ...urls])
    } catch {
      dispatch(addToast({ type: 'error', message: 'Помилка завантаження зображення' }))
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (url: string) => {
    onChange(value.filter(u => u !== url))
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
        Фото (до {MAX_IMAGES})
      </label>

      <div className="flex flex-wrap gap-2">
        {/* Існуючі зображення */}
        {value.map(url => (
          <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
            <img
              src={`${API_BASE_URL}${url}`}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        ))}

        {/* Кнопка додавання */}
        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload size={16} className="text-ink-muted" />
                <span className="text-xs text-ink-muted">Додати</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}