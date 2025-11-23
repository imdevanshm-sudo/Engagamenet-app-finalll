import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
// Import types to fix "Property does not exist" errors
import { useAppData, Location } from '../AppContext';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in React
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = new Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const LiveMap: React.FC = () => {
    const { locations } = useAppData();
    
    const defaultCenter: [number, number] = [26.8467, 80.9462]; 

    return (
        <div className="w-full h-64 bg-slate-800 rounded-xl overflow-hidden relative border border-white/10 shadow-inner z-0">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                />
                {/* Safe check for locations array */}
                {(locations || []).map((loc) => (
                    <Marker key={loc.id || Math.random()} position={[loc.lat, loc.lng]} icon={DefaultIcon}>
                        <Popup>
                            <div className="text-center text-black">
                                <strong>Guest</strong><br/>
                                {new Date(loc.timestamp).toLocaleTimeString()}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveMap;