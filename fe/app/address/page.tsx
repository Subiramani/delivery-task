"use client";

import { useEffect, useState } from "react";
import Map from "./Map";

type Geo = { lat: number; lng: number };

const fields = ["road", "suburb", "city", "district", "state", "postcode", "country"];

export default function AddressPage() {
    const [geo, setGeo] = useState<Geo | null>(null);
    const [denied, setDenied] = useState(false);
    const [input, setInput] = useState("");
    const [result, setResult] = useState<any>(null);

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);

    useEffect(() => {
        if (query.length < 3) return setSuggestions([]);

        const t = setTimeout(async () => {
            const r = await fetch(`${process.env.API_URL}/suggest?q=${query}`);
            setSuggestions(await r.json());
        }, 300); // debounce

        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGeo({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
                setResult({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    rawAddress: "Current Location"
                })
            },
            () => setDenied(true)
        );
    }, []);

    const geocode = async () => {
        const r = await fetch(`${process.env.API_URL}/geocode?q=${input}`);
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
                        placeholder="Search address"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value)
                            setInput(e.target.value)
                        }}
                    />

                    <ul className="border bg-white">
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setQuery(s.label);
                                    setInput(s.label);
                                    setSuggestions([]);
                                }}
                            >
                                {s.label}
                            </li>
                        ))}
                    </ul>
                    <button
                        className="px-4 py-2"
                        onClick={geocode}
                    >
                        Lookup
                    </button>
                </div>
            )}

            {result && (
                <>
                    {denied && <div className="grid grid-cols-2 gap-2 text-sm">
                        {fields.map(f => (
                            <div key={f}>
                                <label className="block text-gray-500">{f}</label>
                                <input
                                    readOnly
                                    value={result.address?.[f] ?? ""}
                                    className="border p-1 w-full"
                                />
                            </div>
                        ))}
                    </div>}

                    {result.lat && result.lng && <Map
                        lat={Number(result.lat)}
                        lng={Number(result.lng)}
                        label={result.rawAddress}
                    />}
                </>
            )}
        </main>
    );
}
