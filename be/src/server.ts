import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/geocode", async (req, res) => {
  try {
    const q = (req.query["q"] as string) || "";
    if (!q.trim()) return res.status(400).json({ error: "Missing query" });

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(
      q
    )}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "interview-demo" }
    });
    // Parse as unknown then validate at runtime
    const raw: unknown = await r.json();
    if (!Array.isArray(raw)) {
      // Unexpected response shape from upstream service
      return res.status(500).json({ error: "Unexpected response format" });
    }
    const data: any[] = raw as any[];

    if (!data.length) return res.status(404).json({ error: "No result" });

    const d = data[0];
    return res.json({
      lat: d.lat,
      lng: d.lon,
      rawAddress: d.display_name,
      address: d.address
    });
  } catch (err) {
    // Log error server-side if desired
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(4000, () => console.log("Backend on :4000"));
