import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import Modal from '../../../components/Modal'
import { RESPOND_TO_HELP_REQUEST } from '../../../api/queries'
import type { RespondToHelpRequestData } from '../../../api/types'
import { useAppDispatch } from '../../../store/hooks'
import { addToast } from '../../../store/uiSlice'

interface RespondModalProps {
    isOpen: boolean
    onClose: () => void
    helpRequestId: string
    onSuccess: () => void
}

export default function RespondModal({
    isOpen,
    onClose,
    helpRequestId,
    onSuccess,
}: RespondModalProps) {
    const dispatch = useAppDispatch()
    const [message, setMessage] = useState('')

    const [respond, { loading }] = useMutation<RespondToHelpRequestData>(
        RESPOND_TO_HELP_REQUEST,
        {
            onCompleted: (data) => {
                const result = data.helpRequest.respondToHelpRequest
                if (result.error) {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                } else {
                    dispatch(addToast({ type: 'success', message: 'Відгук надіслано!' }))
                    setMessage('')
                    onClose()
                    onSuccess()
                }
            },
            onError: () => dispatch(addToast({
                type: 'error',
                message: 'Не вдалося надіслати відгук',
            })),
        }
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) {
            dispatch(addToast({ type: 'error', message: 'Напишіть повідомлення' }))
            return
        }
        respond({ variables: { helpRequestId, message: message.trim() } })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Відгукнутись на заявку">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                        Ваше повідомлення
                    </label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Розкажіть чому хочете допомогти і як можете це зробити..."
                        maxLength={1000}
                        rows={4}
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary focus:bg-surface transition-colors resize-none"
                    />
                    <p className="text-xs text-ink-soft mt-1 text-right">
                        {message.length}/1000
                    </p>
                </div>

                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-ink hover:border-primary transition-colors"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Надсилання...' : 'Надіслати відгук'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}