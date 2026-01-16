import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());

type CacheEntry = {
  lat: number;
  lng: number;
  rawAddress: string;
  address: any;
};

const cache = new Map<string, CacheEntry[]>();

app.get("/geocode", async (req, res) => {
  try {
    const searchQuery = (req.query["q"] as string) || "";
    if (!searchQuery.trim())
      return res.status(400).json({ error: "Missing query" });

    const normalizeInput = (input: string) =>
      input
        .replace(/[–—-]/g, ",")
        .replace(/\s+/g, " ")
        .trim();

    const normalizeText = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

    const geoBucket = (lat: number, lng: number) =>
      `${lat.toFixed(2)}:${lng.toFixed(2)}`;

    /* ---------- Semantic Cache Lookup ---------- */

    const normalizedQuery = normalizeText(searchQuery);

    for (const [, entries] of cache) {
      for (const entry of entries) {
        if (
          normalizedQuery.includes(normalizeText(entry.rawAddress))
        ) {
          return res.json({ ...entry, cacheHit: true });
        }
      }
    }

    /* ---------- Progressive Degradation ---------- */

    const parts = normalizeInput(searchQuery)
      .split(",")
      .map(p => p.trim())
      .filter(Boolean);

    let results: any[] | null = null;
    const attemptedQueries: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const attempt = parts.slice(i).join(", ");
      attemptedQueries.push(attempt);

      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(
        attempt
      )}`;

      const fetchResponse = await fetch(url, {
        headers: { "User-Agent": "interview-demo" }
      });

      const raw: unknown = await fetchResponse.json();
      if (Array.isArray(raw) && raw.length > 0) {
        results = raw;
        break;
      }
    }

    if (!results) {
      return res.status(404).json({
        error: "No result after degradation",
        tried: attemptedQueries
      });
    }

    /* ---------- Cache Store ---------- */

    const firstResult = results[0];

    const entry = {
      lat: Number(firstResult.lat),
      lng: Number(firstResult.lon),
      rawAddress: firstResult.display_name,
      address: firstResult.address
    };

    const bucket = geoBucket(entry.lat, entry.lng);
    if (!cache.has(bucket)) cache.set(bucket, []);
    cache.get(bucket)!.push(entry);

    return res.json({
      ...entry,
      tried: attemptedQueries
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/suggest", async (req, res) => {
  const q = (req.query["q"] as string) || "";
  if (q.length < 3) return res.json([]);

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;

  const r = await fetch(url, {
    headers: { "User-Agent": "interview-demo" }
  });

  const raw: unknown = await r.json();
  const data: any[] = Array.isArray(raw) ? (raw as any[]) : [];

  return res.json(
    data.map(d => ({
      label: d.display_name,
      lat: d.lat,
      lng: d.lon
    }))
  );
});

app.get("/health", (_, res) => {
  res.json({ status: "Render app check success" });
});


app.listen(4000, () => console.log("Backend on :4000"));

const wss = new WebSocketServer({ port: 5000 });

let lat = 19.018255;   // Vashi-ish
let lng = 72.847938;

wss.on("connection", ws => {
  const timer = setInterval(() => {
    lat += 0.0001;
    lng += 0.0001;

    ws.send(JSON.stringify({
      lat,
      lng,
      ts: Date.now()
    }));
  }, 1000);

  ws.on("close", () => clearInterval(timer));
});

console.log("WebSocket server on :5000");