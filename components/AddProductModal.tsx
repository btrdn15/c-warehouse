"use client";

import { useRef, useState } from "react";
import { formatDateLabel, parseMonthValue } from "@/lib/date";
import { compressImage } from "@/lib/image";
import DateFields from "@/components/DateFields";

interface AddProductModalProps {
  defaultDate: string;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    added_by: string;
    date: string;
    price: string;
    cargo_price: string;
    image: string | null;
  }) => Promise<void>;
}

export default function AddProductModal({
  defaultDate,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [addedBy, setAddedBy] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cargoPrice, setCargoPrice] = useState("");
  const initialDate = parseMonthValue(defaultDate);
  const [year, setYear] = useState(initialDate.year);
  const [month, setMonth] = useState(initialDate.month);
  const [day, setDay] = useState("");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !addedBy.trim() ||
      !name.trim() ||
      !year ||
      !month ||
      !price.trim() ||
      !cargoPrice.trim()
    ) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        added_by: addedBy.trim(),
        name: name.trim(),
        date: formatDateLabel(year, month, day),
        price: price.trim(),
        cargo_price: cargoPrice.trim(),
        image: imagePreview,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Бараа нэмэхэд алдаа гарлаа"
      );
    } finally {
      setSubmitting(false);
    }
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
              Каргоны үнэ
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={cargoPrice}
              onChange={(e) => setCargoPrice(e.target.value)}
              placeholder="Жишээ: 25000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Огноо (он, сар, өдөр)
            </label>
            <DateFields
              year={year}
              month={month}
              day={day}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onDayChange={setDay}
            />
          </div>

          <div>
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

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={imagePreview}
                  alt=""
                  className="h-44 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label="Зураг устгах"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={imageLoading}
                  className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
                  aria-label="Зураг солих"
                >
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex h-36 items-center justify-center gap-10 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={imageLoading}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                  aria-label="Камераар зураг авах"
                >
                  <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a41.763 41.763 0 00-1.134-.175 2.31 2.31 0 00-1.64-1.055L15.75 5.5M12 16.5a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={imageLoading}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                  aria-label="Зургийн цомгоос сонгох"
                >
                  <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </button>
              </div>
            )}

            {imageLoading && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
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
