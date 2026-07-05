"use client";

import { useRef, useState } from "react";
import { getDefaultMonthValue, monthValueToLabel } from "@/lib/date";
import { compressImage } from "@/lib/image";

interface AddProductModalProps {
  defaultDate: string;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    added_by: string;
    date: string;
    price: string;
    image: string | null;
  }) => void;
}

export default function AddProductModal({
  defaultDate,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [addedBy, setAddedBy] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [monthValue, setMonthValue] = useState(
    defaultDate.includes("-") ? defaultDate : getDefaultMonthValue()
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleImageSelect(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Зөвхөн зураг сонгоно уу");
      return;
    }
    setImageLoading(true);
    setError("");
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {
      setError("Зураг ачаалахад алдаа гарлаа");
    } finally {
      setImageLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addedBy.trim() || !name.trim() || !monthValue || !price.trim()) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }
    setSubmitting(true);
    onSubmit({
      added_by: addedBy.trim(),
      name: name.trim(),
      date: monthValueToLabel(monthValue),
      price: price.trim(),
      image: imagePreview,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Бараа нэмэх</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Оруулсан хүн
            </label>
            <input
              type="text"
              value={addedBy}
              onChange={(e) => setAddedBy(e.target.value)}
              placeholder="Таны нэр"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Барааны нэр
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Үнэ (анх авсан)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Жишээ: 150000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Огноо (он, сар)
            </label>
            <input
              type="month"
              value={monthValue}
              onChange={(e) => setMonthValue(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Зураг
            </label>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={imageLoading}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Камер
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={imageLoading}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Зураг сонгох
              </button>
            </div>
            {imageLoading && (
              <p className="mt-2 text-xs text-gray-500">Зураг бэлдэж байна...</p>
            )}
            {imagePreview && (
              <div className="relative mt-3">
                <img
                  src={imagePreview}
                  alt="Барааны зураг"
                  className="h-40 w-full rounded-lg border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white"
                >
                  Устгах
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || imageLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Нэмж байна..." : "Нэмэх"}
          </button>
        </form>
      </div>
    </div>
  );
}
