import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { useAppDispatch } from '../../../store/hooks'
import { addToast } from '../../../store/uiSlice'
import Spinner from '../../../components/Spinner'
import { getImageUrl } from '../../../utils/imageUrl'

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

    if (files.length > MAX_IMAGES) {
      dispatch(addToast({
        type: 'info',
        message: `Можна завантажити не більше ${MAX_IMAGES} фото за раз`
      }))
    }

    const toUpload = Array.from(files).slice(0, MAX_IMAGES)
    setUploading(true)

    try {
      const urls: string[] = []

      for (const file of toUpload) {
        const formData = new FormData()
        formData.append('files', file, file.name)

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/files/help-requests`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const data = await res.json()
        const fullUrls = data.imageUrls
        urls.push(...fullUrls)
      }

      const combined = [...value, ...urls]
      const latest = combined.slice(-MAX_IMAGES)
      onChange(latest)
    } catch {
      dispatch(addToast({ type: 'error', message: 'Помилка завантаження зображення' }))
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
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
              src={getImageUrl(url)}
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

        {/* Кнопка додавання - завжди доступна для FIFO ротації */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Spinner size={16} />
          ) : (
            <>
              <Upload size={16} className="text-ink-muted" />
              <span className="text-xs text-ink-muted">Додати</span>
            </>
          )}
        </button>
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