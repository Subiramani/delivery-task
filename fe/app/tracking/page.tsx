"use client";

import { useEffect, useState } from "react";
import TrackingMap from "./TrackingMap";

export default function TrackingPage() {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onmessage = e => {
      const p = JSON.parse(e.data);
      setPoints(prev => [...prev.slice(-20), p]);
    };

    return () => ws.close();
  }, []);

  return <TrackingMap points={points} />;
}
