import ReasonModal from '../../components/ReasonModal'

interface RejectStageModalProps {
  isOpen: boolean
  onClose: () => void
  onReject: (reason: string) => void
  loading: boolean
}

export default function RejectStageModal({
  isOpen,
  onClose,
  onReject,
  loading,
}: RejectStageModalProps) {
  return (
    <ReasonModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onReject}
      isLoading={loading}
      title="Відхилити етап"
      description="Будь ласка, поясніть, чому цей етап не може бути прийнятий у поточному вигляді."
      tip="Це допоможе вашому партнеру виправити помилки"
      confirmText="Відхилити"
      confirmVariant="error"
      placeholder="Опишіть зауваження..."
    />
  )
}