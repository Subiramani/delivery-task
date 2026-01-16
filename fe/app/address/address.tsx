"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("./Map"), { ssr: false });

type Geo = { lat: number; lng: number };

export default function AddressPage() {
    const [geo, setGeo] = useState<Geo | null>(null);
    const [denied, setDenied] = useState(false);
    const [input, setInput] = useState("");
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) =>
                setGeo({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                }),
            () => setDenied(true)
        );
    }, []);

    const geocode = async () => {
        const r = await fetch(`http://localhost:4000/geocode?q=${input}`);
        const d = await r.json();
        setResult(d);
    };

    return (
        <main className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Address Lookup</h1>

            {geo && (
                <div className="text-sm">
                    📍 Current Location: {geo.lat}, {geo.lng}
                </div>
            )}

            {denied && (
                <div className="space-y-2">
                    <input
                        className="border p-2 w-full"
                        placeholder="Enter full address"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        className="px-4 py-2 bg-black text-white"
                        onClick={geocode}
                    >
                        Lookup
                    </button>
                </div>
            )}

            {result && (
                <pre className="p-3 text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </main>
    );
}
