import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Фікс для іконки маркера в Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface RequestMapProps {
    latitude: number
    longitude: number
}

export default function RequestMap({ latitude, longitude }: RequestMapProps) {
    return (
        <div className="h-64 rounded-xl overflow-hidden border border-border">
            <MapContainer
                center={[latitude, longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[latitude, longitude]}>
                    <Popup>Місце отримання допомоги</Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}