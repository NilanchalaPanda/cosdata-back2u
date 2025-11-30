/* eslint-disable @typescript-eslint/no-explicit-any */
// app/search/page.tsx
"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const CAMPUS_OPTIONS = ["VESIT", "R_City_Mall", "Phoenix_Mall"];

type SearchResult = {
  id: string;
  score: number;
  title: string;
  textDescription: string;
  campusTag: string;
  locationName: string;
  imageBase64?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  createdAt?: string | null;
};

export default function SearchPage() {
  const [campusTag, setCampusTag] = useState(CAMPUS_OPTIONS[0]);
  const [queryText, setQueryText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campusTag,
          queryText,
          imageBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Search failed");
      }
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">I LOST something</h1>
      <p className="text-slate-300 text-sm">
        Describe what you lost. We’ll semantically match it with items other
        people have found in the same place.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Place / Campus</label>
          <select
            value={campusTag}
            onChange={(e) => setCampusTag(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          >
            {CAMPUS_OPTIONS.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Describe the item</label>
          <textarea
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="e.g. Blue bottle with Marvel sticker and ‘Rohan’ written on it"
            rows={3}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Optional: upload a similar image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          {imageBase64 && (
            <Image
              src={imageBase64}
              alt="reference"
              className="mt-2 w-32 h-32 object-cover rounded-lg border border-slate-700"
              width={128}
              height={128}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </form>

      <div className="mt-6 space-y-3">
        {results.length > 0 && (
          <h2 className="text-sm font-semibold text-slate-200">
            Possible matches ({results.length})
          </h2>
        )}

        {results.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-4 rounded-xl border border-slate-700 bg-slate-900/60"
          >
            {item.imageBase64 && (
              <Image
                src={item.imageBase64}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                width={100}
                height={100}
              />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-xs text-slate-300">{item.textDescription}</p>
              <p className="text-xs text-slate-400 mt-1">
                Found at {item.locationName} ({item.campusTag})
              </p>
              <p className="text-xs text-emerald-400 mt-1">
                {item.contactName && <>Contact: {item.contactName}</>}
                {item.contactPhone && <> • {item.contactPhone}</>}
              </p>
              {item.contactNote && (
                <p className="text-xs text-slate-400">{item.contactNote}</p>
              )}
              <p className="text-[10px] text-indigo-300 mt-1">
                Match confidence: {(item.score * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        ))}

        {!loading && !error && results.length === 0 && (
          <p className="text-xs text-slate-400">
            No matches yet. Try a different description or check with security.
          </p>
        )}
      </div>
    </div>
  );
}
