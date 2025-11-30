"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import PlaceTagSelector from "@/components/PlaceTagSelector";

type Item = {
  id: string;
  score?: number;
  title: string;
  textDescription: string;
  campusTag: string;
  locationName: string;
  imageBase64?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  createdAt: string;
};

export default function AllItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [placeFilter, setPlaceFilter] = useState<string | null>(null);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAllItems() {
    setLoading(true);

    const res = await fetch("/api/list");
    const data = await res.json();

    console.log("data - ", data);

    if (data.ok) setItems(data.items);
    setLoading(false);
  }

  useEffect(() => {
    loadAllItems();
  }, []);

  async function handleSearch() {
    if (!placeFilter || !searchText) return;

    setSearching(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campusTag: placeFilter,
          queryText: searchText,
        }),
      });

      const data = await res.json();

      if (!data.ok) throw new Error(data.error);

      setItems(data.results || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("Search failed: " + err.message);
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  function resetSearch() {
    setSearchText("");
    setPlaceFilter(null);
    loadAllItems();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-6 py-4 z-20">
        <h1 className="text-xl font-bold text-gray-900">All Found Items</h1>

        {/* Filters */}
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4 items-center">
          <PlaceTagSelector selected={placeFilter} onSelect={setPlaceFilter} />

          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search item keywords…"
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 text-sm focus:border-primary"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!searchText || !placeFilter}
            className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-primary/90"
          >
            Search
          </button>

          {(searchText || placeFilter) && (
            <button
              onClick={resetSearch}
              className="text-sm text-gray-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading || searching ? (
          <p className="col-span-full text-center text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No items found
          </p>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items.map((itemRaw: any) => {
            // Normalize fields for UI
            const item = {
              id: itemRaw.id,
              title: itemRaw.title,
              textDescription:
                itemRaw.text_description ?? itemRaw.textDescription,
              campusTag: itemRaw.campus_tag ?? itemRaw.campusTag,
              locationName: itemRaw.location_name ?? itemRaw.locationName,
              imageBase64: itemRaw.image_base64 ?? itemRaw.imageBase64,
              contactName: itemRaw.contact_name ?? itemRaw.contactName,
              contactPhone: itemRaw.contact_phone ?? itemRaw.contactPhone,
              createdAt: itemRaw.created_at ?? itemRaw.createdAt,
              score: itemRaw.score,
            };

            return (
              <div
                key={item.id}
                className="rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-primary p-3 transition cursor-pointer"
              >
                {item.imageBase64 ? (
                  <Image
                    src={item.imageBase64}
                    alt={item.title}
                    width={400}
                    height={200}
                    className="rounded-lg h-36 w-full object-cover"
                  />
                ) : (
                  <div className="h-36 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}

                <h3 className="mt-3 font-semibold text-gray-900 text-sm line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {item.textDescription}
                </p>

                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>📍 {item.locationName}</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                    {item.campusTag}
                  </span>
                </div>

                {item.score !== undefined && (
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">
                    🔍 {(item.score * 100).toFixed(0)}% Match
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
