/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const CAMPUS_OPTIONS = ["VESIT", "R_City_Mall", "Phoenix_Mall"];

export default function ReportPage() {
  const [campusTag, setCampusTag] = useState(CAMPUS_OPTIONS[0]);
  const [locationName, setLocationName] = useState("");
  const [title, setTitle] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactNote, setContactNote] = useState("Available at security desk");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setError(null);
      },
      () => {
        setError("Could not get your location.");
      }
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          textDescription,
          campusTag,
          locationName,
          lat,
          lng,
          imageBase64,
          contactName,
          contactPhone,
          contactNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit item");
      }

      setMessage("Item reported successfully! It’s now searchable.");
      setTitle("");
      setTextDescription("");
      setLocationName("");
      setImageBase64(null);
      setContactName("");
      setContactPhone("");
      setContactNote("Available at security desk");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">I FOUND something</h1>
      <p className="text-slate-300 text-sm">
        Fill this form when you find an item on campus/mall. It becomes
        searchable for the person who lost it.
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
          <label className="block text-sm font-medium">Exact spot</label>
          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Library 2nd floor, near water cooler"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleUseLocation}
            className="mt-1 text-xs text-indigo-300 underline"
          >
            Use my current GPS location
          </button>
          {lat && lng && (
            <p className="text-xs text-emerald-400">
              Location captured: {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Item title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Black Lenovo laptop bag"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Visual description
          </label>
          <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="Brand, stickers, marks, name tags…"
            rows={3}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Item image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          {imageBase64 && (
            <Image
              src={imageBase64}
              alt="preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border border-slate-700"
              width={128}
              height={128}
            />
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Where can they collect it?
          </label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Security / your name"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="mt-2 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
          <input
            value={contactNote}
            onChange={(e) => setContactNote(e.target.value)}
            placeholder="Extra note (e.g. ‘Available 9am–5pm’)"
            className="mt-2 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Report found item"}
        </button>

        {message && <p className="text-sm text-emerald-400 mt-2">{message}</p>}
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </form>
    </div>
  );
}
