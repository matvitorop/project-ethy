import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { ArrowLeft } from 'lucide-react'
import { CREATE_HELP_REQUEST } from '../../api/queries'
import type { CreateHelpRequestData } from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import Modal from '../../components/Modal'
import Button from '../../components/ui/Button'
import { ShieldCheck } from 'lucide-react'

import RequestForm, { type RequestFormValues } from '../../features/requests/components/RequestForm'

export default function CreateRequestPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

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

    const handleSubmit = (values: RequestFormValues) => {
        if (!values.title.trim()) {
            dispatch(addToast({ type: 'error', message: 'Вкажіть назву заявки' }))
            return
        }

        if (!values.description.trim()) {
            dispatch(addToast({ type: 'error', message: 'Вкажіть опис заявки' }))
            return
        }

        createRequest({
            variables: {
                title: values.title.trim(),
                description: values.description.trim(),
                latitude: values.location?.lat ?? null,
                longitude: values.location?.lng ?? null,
                imageUrls: values.imageUrls.length > 0 
                    ? values.imageUrls.slice(0, 5) 
                    : null,
            },
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Назад */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="-ml-2 mb-6 text-ink-muted"
            >
                <ArrowLeft size={16} />
                Назад
            </Button>

            <h1 className="text-2xl font-bold text-ink mb-8"
                style={{ fontFamily: 'Jua, sans-serif' }}>
                Нова заявка
            </h1>

            <RequestForm 
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Створити заявку"
            />

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