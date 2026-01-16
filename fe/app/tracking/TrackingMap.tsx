"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function TrackingMap({ points }: any) {
  if (!points.length) return null;

  const latest = points[points.length - 1];
  const path = points.map((p: any) => [p.lat, p.lng]);

  return (
    <MapContainer center={[latest.lat, latest.lng]} zoom={15} style={{ height: 400 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latest.lat, latest.lng]} />
      <Polyline positions={path} />
    </MapContainer>
  );
}
