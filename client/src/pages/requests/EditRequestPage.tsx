import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client/react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { GET_HELP_REQUEST_BY_ID, EDIT_HELP_REQUEST } from '../../api/queries'
import type { HelpRequestDetailData, EditHelpRequestData } from '../../api/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import Modal from '../../components/Modal'
import Button from '../../components/ui/Button'
import RequestForm, { type RequestFormValues } from '../../features/requests/components/RequestForm'
import { PageSpinner } from '../../components/Spinner'

export default function EditRequestPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const auth = useAppSelector(state => state.auth)
    const [showModerationModal, setShowModerationModal] = useState(false)

    const { data, loading: queryLoading, error } = useQuery<HelpRequestDetailData>(
        GET_HELP_REQUEST_BY_ID,
        { variables: { id }, skip: !id }
    )

    const [editRequest, { loading: mutationLoading }] = useMutation<EditHelpRequestData>(
        EDIT_HELP_REQUEST,
        {
            onCompleted: (data) => {
                const result = data.helpRequest.editHelpRequest
                if (result.error) {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                } else {    
                    setShowModerationModal(true)
                }
            },
            onError: () => dispatch(addToast({
                type: 'error',
                message: "Не вдалося оновити заявку",
            })),
        }
    )

    if (queryLoading) return <PageSpinner />
    if (error || !data?.helpRequestQuer.helpRequestById.item) {
        return (
            <div className="text-center py-20">
                <p className="text-ink-soft">Заявку не знайдено</p>
                <Button onClick={() => navigate(-1)} variant="ghost" className="mt-4">Назад</Button>
            </div>
        )
    }

    const hr = data.helpRequestQuer.helpRequestById.item

    if (hr.creatorId !== auth.userId) {
        return (
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error mb-4">
                    <ShieldCheck size={32} className="rotate-180" />
                </div>
                <h2 className="text-xl font-bold text-ink mb-2">Доступ заборонено</h2>
                <p className="text-ink-soft">Ви не можете редагувати чужу заявку.</p>
                <Button onClick={() => navigate(`/requests/${id}`)} variant="ghost" className="mt-6">До перегляду заявки</Button>
            </div>
        )
    }

    const handleSubmit = (values: RequestFormValues) => {
        editRequest({
            variables: {
                helpRequestId: id,
                title: values.title.trim(),
                description: values.description.trim(),
                latitude: values.location?.lat ?? null,
                longitude: values.location?.lng ?? null,
                imageUrls: values.imageUrls,
            },
        })
    }

    const initialValues = {
        title: hr.title,
        description: hr.description,
        location: hr.latitude && hr.longitude ? { lat: hr.latitude, lng: hr.longitude } : null,
        imageUrls: hr.imageUrls
    }

    return (
        <div className="max-w-2xl mx-auto">
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
                Редагування заявки
            </h1>

            <RequestForm 
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={mutationLoading}
                submitLabel="Зберегти зміни"
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
                            Заявку відправлено на повторну перевірку
                        </h3>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            Оскільки ви змінили дані заявки, вона знову проходить модерацію. 
                            Це зазвичай займає не більше 24 годин.
                        </p>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={() => navigate('/profile?tab=requests')}
                    >
                        До профілю
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
