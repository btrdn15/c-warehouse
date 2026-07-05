"use client";

import { useState } from "react";
import { formatYearMonth } from "@/lib/date";

interface AddProductModalProps {
  defaultDate: string;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    added_by: string;
    date: string;
  }) => void;
}

export default function AddProductModal({
  defaultDate,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [addedBy, setAddedBy] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addedBy.trim() || !name.trim() || !date.trim()) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }
    setSubmitting(true);
    onSubmit({
      added_by: addedBy.trim(),
      name: name.trim(),
      date: date.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Бараа нэмэх</h2>
          <button
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
              Огноо (он, сар)
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Жишээ: 2026 оны 7 сар"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Нэмж байна..." : "Нэмэх"}
          </button>
        </form>
      </div>
    </div>
  );
}
