import { useQuery } from '@apollo/client/react'
import { UserCircle, Clock } from 'lucide-react'
import Modal from '../../../components/Modal'
import { GET_HELP_REQUEST_RESPONSES } from '../../../api/queries'
import type { HelpRequestResponsesData, HelpRequestResponse } from '../../../api/types'
import { PageSpinner } from '../../../components/Spinner'

const RESPONSE_STATUS = {
    0: { label: 'Очікує', color: 'text-warning' },
    1: { label: 'Прийнято', color: 'text-success' },
    2: { label: 'Відхилено', color: 'text-error' },
    3: { label: 'Скасовано', color: 'text-ink-muted' },
} as const

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
}

interface CandidateCardProps {
    response: HelpRequestResponse
    onAssign: (responseId: string) => void
    canAssign: boolean
}

function CandidateCard({ response, onAssign, canAssign }: CandidateCardProps) {
    const statusConfig = RESPONSE_STATUS[response.status as keyof typeof RESPONSE_STATUS]

    return (
        <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <UserCircle size={20} className="text-ink-muted flex-shrink-0" />
                    <span className="font-medium text-ink text-sm">{response.username}</span>
                </div>
                <span className={`text-xs font-medium ${statusConfig?.color}`}>
                    {statusConfig?.label}
                </span>
            </div>

            <p className="text-sm text-ink leading-relaxed">{response.message}</p>

            <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                    <Clock size={12} />
                    {formatDate(response.createdAtUtc)}
                </span>

                {canAssign && response.status === 0 && (
                    <button
                        onClick={() => onAssign(response.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                    >
                        Призначити
                    </button>
                )}
            </div>
        </div>
    )
}

interface CandidatesModalProps {
    isOpen: boolean
    onClose: () => void
    helpRequestId: string
    canAssign: boolean
    onAssign: (responseId: string) => void
}

export default function CandidatesModal({
    isOpen,
    onClose,
    helpRequestId,
    canAssign,
    onAssign,
}: CandidatesModalProps) {
    const { data, loading } = useQuery<HelpRequestResponsesData>(
        GET_HELP_REQUEST_RESPONSES,
        {
            variables: { helpRequestId },
            skip: !isOpen,
            fetchPolicy: 'network-only',
        }
    )

    const items = data?.helpRequestQuer.helpRequestResponses.items ?? []

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Кандидати (${items.length})`}>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {loading && <PageSpinner />}

                {!loading && items.length === 0 && (
                    <div className="text-center py-8 text-ink-muted text-sm">
                        Поки немає відгуків
                    </div>
                )}

                {!loading && items.map(response => (
                    <CandidateCard
                        key={response.id}
                        response={response}
                        canAssign={canAssign}
                        onAssign={onAssign}
                    />
                ))}
            </div>
        </Modal>
    )
}