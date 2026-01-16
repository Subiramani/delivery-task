"use client";


import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// dynamically import react-leaflet components to avoid SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

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
