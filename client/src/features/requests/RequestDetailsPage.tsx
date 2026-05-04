import { useState, lazy, Suspense } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { ArrowLeft, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { GET_HELP_REQUEST_BY_ID, GET_STAGES, GET_EVENT_LOG } from '../../api/queries'
import type {
  HelpRequestDetailData,
  StagesData,
  EventLogData
} from '../../api/types'
import { useAppSelector } from '../../store/hooks'
import { PageSpinner } from '../../components/Spinner'
import StagesTimeline from './components/StagesTimeline'
import EventLogList from './components/EventLogList'
import RespondModal from './components/RespondModal'
const API_BASE_URL = 'http://localhost:5274'

// Lazy load карти щоб не блокувати рендер
const RequestMap = lazy(() => import('./components/RequestMap'))

const STATUS_CONFIG = {
  0: { label: 'Чернетка',  color: 'bg-ink-soft/20 text-ink-muted' },
  1: { label: 'Відкрита',  color: 'bg-success/15 text-success' },
  2: { label: 'В процесі', color: 'bg-info/15 text-info' },
  3: { label: 'Виконана',  color: 'bg-purple-100 text-purple-600' },
  4: { label: 'Скасована', color: 'bg-error/15 text-error' },
} as const

type DetailTab = 'stages' | 'log'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = useAppSelector(s => s.auth.userId)
  const [activeTab, setActiveTab] = useState<DetailTab>('stages')
  const [activeImage, setActiveImage] = useState(0)
    const [respondModalOpen, setRespondModalOpen] = useState(false)

  const { data, loading, error } = useQuery<HelpRequestDetailData>(
    GET_HELP_REQUEST_BY_ID,
    { variables: { id }, fetchPolicy: 'cache-and-network' }
  )

  const { data: stagesData } = useQuery<StagesData>(
    GET_STAGES,
    { variables: { helpRequestId: id }, fetchPolicy: 'cache-and-network' }
  )

  const { data: logData } = useQuery<EventLogData>(
    GET_EVENT_LOG,
    { variables: { helpRequestId: id }, fetchPolicy: 'cache-and-network' }
  )

  if (loading) return <PageSpinner />

  if (error || !data?.helpRequestQuer.helpRequestById.item) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={40} className="text-error mx-auto mb-4" />
        <p className="text-ink-muted">Заявку не знайдено</p>
        <Link to="/requests" className="text-primary text-sm mt-2 inline-block hover:underline">
          ← Повернутись до списку
        </Link>
      </div>
    )
  }

  const hr = data.helpRequestQuer.helpRequestById.item
  const isOwner = userId === hr.creatorId
  const statusConfig = STATUS_CONFIG[hr.status as keyof typeof STATUS_CONFIG]
  const stages = stagesData?.helpRequestQuer.stages.items ?? []
  const events = logData?.helpRequestQuer.eventLog.items ?? []
  const hasLocation = hr.latitude !== null && hr.longitude !== null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Назад */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Назад до списку
      </button>

      {/* Зображення */}
      {hr.imageUrls.length > 0 && (
        <div className="mb-6">
          <div className="h-64 rounded-xl overflow-hidden border border-border bg-surface-muted">
            <img
              src={`${API_BASE_URL}${hr.imageUrls[activeImage]}`}
              alt={hr.title}
              className="w-full h-full object-cover"
            />
          </div>
          {hr.imageUrls.length > 1 && (
            <div className="flex gap-2 mt-2">
              {hr.imageUrls.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setActiveImage(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={`${API_BASE_URL}${url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Заголовок + статус */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-ink"
            style={{ fontFamily: 'Jua, sans-serif' }}>
          {hr.title}
        </h1>
        {statusConfig && (
          <span className={`flex-shrink-0 px-3 py-1 text-sm font-medium rounded-full ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        )}
      </div>

      {/* Мета */}
      <div className="flex items-center gap-4 text-sm text-ink-muted mb-6">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {formatDate(hr.createdAtUtc)}
        </span>
        {hasLocation && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            Є геолокація
          </span>
        )}
      </div>

      {/* Основний контент */}
      <div className={`grid gap-6 mb-6 ${hasLocation ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Опис */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Опис
          </h2>
          <p className="text-ink leading-relaxed whitespace-pre-wrap">
            {hr.description}
          </p>

          {/*hr.cancellationReason && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error font-medium mb-1">Причина скасування</p>
              {/* <p className="text-sm text-ink-muted">{hr.cancellationReason}</p>}
            </div>
          )*/}
        </div>

        {/* Карта */}
        {hasLocation && (
          <Suspense fallback={
            <div className="h-64 rounded-xl border border-border bg-surface-muted flex items-center justify-center">
              <p className="text-ink-muted text-sm">Завантаження карти...</p>
            </div>
          }>
            <RequestMap
              latitude={hr.latitude!}
              longitude={hr.longitude!}
            />
          </Suspense>
        )}
      </div>

      {/* Кнопки дій */}
      <div className="flex flex-wrap gap-3 mb-8">
        {isOwner && hr.status === 1 && (
          <>
            <Link
              to={`/requests/${hr.id}/edit`}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:border-primary text-ink transition-colors"
            >
              Редагувати
            </Link>
            <button className="px-4 py-2 text-sm font-medium border border-error/30 rounded-lg hover:border-error text-error transition-colors">
              Скасувати
            </button>
            <button className="px-4 py-2 text-sm font-medium border border-error/30 rounded-lg hover:border-error text-error transition-colors">
              Видалити
            </button>
          </>
        )}

        {isOwner && hr.status === 4 && (
          <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:border-primary text-ink transition-colors">
            Відновити
          </button>
        )}

        {isOwner && hr.status === 1 && (
          <Link
            to={`/requests/${hr.id}/candidates`}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Кандидати
          </Link>
        )}

        {!isOwner && hr.status === 1 && (
            <button
                onClick={() => setRespondModalOpen(true)}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
                Відгукнутись
            </button>
        )}
      </div>

      {/* Вкладки — Етапи і Лог */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {([
            { key: 'stages', label: `Етапи (${stages.length})` },
            { key: 'log',    label: `Історія подій (${events.length})` },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'stages' && (
            <StagesTimeline stages={stages} />
          )}
          {activeTab === 'log' && (
            <EventLogList events={events} />
          )}
        </div>
          </div>

          <RespondModal
              isOpen={respondModalOpen}
              onClose={() => setRespondModalOpen(false)}
              helpRequestId={hr.id}
              onSuccess={() => { }}
          />
    </div>
  )
}