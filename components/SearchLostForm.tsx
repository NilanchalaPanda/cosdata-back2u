"use client";

import { useState } from "react";
import { Search, X, Sparkles, Camera } from "lucide-react";
import PlaceTagSelector from "./PlaceTagSelector";
import Image from "next/image";

interface SearchLostFormProps {
  onClose: () => void;
}

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
};

export default function SearchLostForm({ onClose }: SearchLostFormProps) {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  async function handleSubmit() {
    if (!selectedPlace || !searchQuery) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campusTag: selectedPlace,
          queryText: searchQuery,
          imageBase64,
        }),
      });

      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Search failed");

      setResults(data.results || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setResults([]);
    setSearched(false);
    setSearchQuery("");
    setImageBase64(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-gray-300">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Search Lost Item
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI-powered similarity
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search UI */}
          {!searched ? (
            <>
              <div>
                <label className="text-sm font-semibold block mb-2 text-gray-800">
                  Where did you lose it?
                </label>
                <PlaceTagSelector
                  selected={selectedPlace}
                  onSelect={setSelectedPlace}
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2 text-gray-800">
                  Describe the item
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Blue bottle with anime sticker"
                    className="w-full border rounded-lg py-2 pl-10 px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2 text-gray-800">
                  Add a reference image (optional)
                </label>
                {imageBase64 ? (
                  <div className="relative">
                    <Image
                      src={imageBase64}
                      alt="preview"
                      width={400}
                      height={200}
                      className="rounded-xl h-32 w-full object-cover"
                    />
                    <button
                      onClick={() => setImageBase64(null)}
                      className="absolute top-2 right-2 bg-black/40 text-white p-1 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 h-24 border-2 border-dashed rounded-xl cursor-pointer">
                    <Camera className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedPlace || !searchQuery}
                className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </>
          ) : (
            <>
              {/* Results - after search */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Search Results for{" "}
                  <span className="font-semibold">{searchQuery}</span>
                </p>
                <button
                  onClick={resetSearch}
                  className="text-sm text-primary font-medium"
                >
                  New Search
                </button>
              </div>

              {loading && (
                <p className="text-gray-500 text-sm">Finding matches...</p>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-xl hover:border-primary transition"
                    >
                      <div className="flex gap-3">
                        {item.imageBase64 && (
                          <Image
                            src={item.imageBase64}
                            alt="found item"
                            width={80}
                            height={80}
                            className="rounded-lg object-cover border"
                          />
                        )}

                        <div className="flex-1">
                          <h3 className="text-sm font-semibold">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-700">
                            {item.textDescription}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {item.locationName} • {item.campusTag}
                          </p>
                          <p className="text-xs text-primary mt-1">
                            Contact: {item.contactName || "Security Desk"}
                            {item.contactPhone && <> • {item.contactPhone}</>}
                          </p>
                          <p className="text-[10px] text-indigo-500 mt-1">
                            Match score: {(item.score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !loading && (
                  <p className="text-sm text-gray-500">
                    No matches found. Try changing your description.
                  </p>
                )
              )}
            </>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full mt-4 border rounded-lg py-2 text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
