"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProductStatus } from "@/lib/types";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/types";

interface StatusPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (status: ProductStatus) => void;
  currentStatus?: ProductStatus | null;
  title?: string;
}

export default function StatusPickerSheet({
  open,
  onClose,
  onSelect,
  currentStatus = null,
  title = "Төлөв сонгох",
}: StatusPickerSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Хаах"
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

        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => {
            const selected = currentStatus === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.98] ${STATUS_COLORS[option]} ${
                  selected
                    ? "ring-2 ring-blue-500 ring-offset-1"
                    : "hover:brightness-95"
                }`}
              >
                <span>{option}</span>
                {selected && (
                  <svg
                    className="h-5 w-5 shrink-0 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
