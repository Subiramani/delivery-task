"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans gap-2">
      <Link href="/address" className="px-4 py-2 bg-black text-white rounded-2xl">
        Go to Address Lookup
      </Link>
      <Link href="/tracking" className="px-4 py-2 bg-black text-white rounded-2xl">
        Go to Tracking
      </Link>
    </div>
  );
}
