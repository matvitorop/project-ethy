import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents
} from 'react-leaflet'
import L from 'leaflet'
import { Navigation } from 'lucide-react'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (location: { lat: number; lng: number } | null) => void
}

function MapClickHandler({
  onChange,
}: {
  onChange: (loc: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const defaultCenter: [number, number] = [49.0, 31.0] // Центр України

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.error('Geolocation error:', err)
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Локація (необов'язково)
        </label>
        <button
          type="button"
          onClick={handleGeolocate}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-light transition-colors"
        >
          <Navigation size={12} />
          Моє місцезнаходження
        </button>
      </div>

      <div className="h-56 rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={value ? [value.lat, value.lng] : defaultCenter}
          zoom={value ? 13 : 6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onChange={onChange} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              eventHandlers={{
                dragend(e) {
                  const m = e.target as L.Marker
                  const pos = m.getLatLng()
                  onChange({ lat: pos.lat, lng: pos.lng })
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {value && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-error hover:underline"
          >
            Очистити
          </button>
        </div>
      )}

      {!value && (
        <p className="text-xs text-ink-soft">
          Клікніть на карту щоб вказати місце
        </p>
      )}
    </div>
  )
}