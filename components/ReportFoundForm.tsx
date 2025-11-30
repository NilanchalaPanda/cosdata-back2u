"use client";

import { useState } from "react";
import { MapPin, X, Camera } from "lucide-react";
import PlaceTagSelector from "./PlaceTagSelector";
import Image from "next/image";

interface ReportFoundFormProps {
  onClose: () => void;
}

export default function ReportFoundForm({ onClose }: ReportFoundFormProps) {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [locationName, setLocationName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleUseLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitReport = async () => {
    if (!selectedPlace || !locationName || !textDescription) return;

    setLoading(true);

    const payload = {
      title: textDescription.split(" ")[0] + " Item",
      textDescription,
      campusTag: selectedPlace,
      locationName,
      lat,
      lng,
      imageBase64,
      contactName: contactLocation,
      contactPhone: contactInfo,
      contactNote: "Available at " + contactLocation,
    };

    try {
      console.log("Payload - ", payload);

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("inserting api data - ", data);

      if (res.ok) {
        setSuccessMsg("✔ Item successfully reported!");
        setTimeout(() => onClose(), 1500);
      } else {
        alert("Something went wrong!");
        console.error(data.error);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-gray-300">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center px-6 py-4 bg-white border-b">
          <div>
            <h2 className="text-xl font-bold">Report Found Item</h2>
            <p className="text-sm text-gray-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {successMsg && (
            <p className="text-green-600 font-semibold">{successMsg}</p>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <p className="font-semibold">Where did you find it?</p>
              <PlaceTagSelector
                selected={selectedPlace}
                onSelect={setSelectedPlace}
              />

              <div>
                <label className="text-sm font-semibold block mb-1">
                  Specific landmark
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Cafeteria table 5"
                    className="w-full border rounded-lg py-2 pl-10 px-3"
                  />
                </div>
              </div>

              <button
                disabled={!selectedPlace || !locationName}
                onClick={() => setStep(2)}
                className="w-full bg-primary text-white rounded-lg py-2 mt-4 font-semibold"
              >
                Continue
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <p className="text-sm font-semibold">Upload Item Photo</p>

              {imageBase64 ? (
                <Image
                  src={imageBase64}
                  alt="item"
                  width={400}
                  height={200}
                  className="rounded-xl w-full h-48 object-cover"
                />
              ) : (
                <label className="flex flex-col items-center border-2 border-dashed h-44 rounded-xl cursor-pointer">
                  <Camera className="h-8 w-8 text-gray-500" />
                  <span className="text-sm text-gray-500 mt-2">
                    Click to upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}

              <textarea
                rows={4}
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="Describe color, brand, size…"
                className="w-full border rounded-lg px-3 py-2 text-sm mt-3"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/2 border rounded-lg py-2"
                >
                  Back
                </button>
                <button
                  disabled={!textDescription}
                  onClick={() => setStep(3)}
                  className="w-1/2 bg-primary text-white rounded-lg py-2"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <p className="text-sm font-semibold">Where is it now?</p>
              <input
                value={contactLocation}
                onChange={(e) => setContactLocation(e.target.value)}
                placeholder="e.g. Security Desk"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <p className="text-sm font-semibold mt-3">Contact Info</p>
              <input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone or Email"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <button
                onClick={handleUseLocation}
                className="text-xs text-primary underline mt-1"
              >
                Auto-capture my GPS location
              </button>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/2 border rounded-lg py-2"
                >
                  Back
                </button>
                <button
                  onClick={submitReport}
                  className="w-1/2 bg-primary text-white rounded-lg py-2"
                >
                  {loading ? "Saving..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
