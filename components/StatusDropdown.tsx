"use client";

import { useState } from "react";
import type { ProductStatus } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";
import StatusPickerSheet from "@/components/StatusPickerSheet";

interface StatusDropdownProps {
  status: ProductStatus;
  fullWidth?: boolean;
  onChange: (status: ProductStatus) => void;
}

export default function StatusDropdown({
  status,
  fullWidth = false,
  onChange,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(newStatus: ProductStatus) {
    setOpen(false);
    if (newStatus !== status) {
      onChange(newStatus);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-between gap-2 rounded-xl border-2 px-3.5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${STATUS_COLORS[status]} ${
          fullWidth ? "w-full" : "min-w-[130px]"
        }`}
      >
        <span className="truncate">{status}</span>
        <svg
          className="h-4 w-4 shrink-0 opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <StatusPickerSheet
        open={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        currentStatus={status}
      />
    </>
  );
}
