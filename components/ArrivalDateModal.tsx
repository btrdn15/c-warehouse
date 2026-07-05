"use client";

import { useState } from "react";
import { formatDateLabel, parseMonthValue } from "@/lib/date";
import DateFields from "@/components/DateFields";

interface ArrivalDateModalProps {
  title?: string;
  onClose: () => void;
  onSubmit: (arrivedDate: string) => void;
}

export default function ArrivalDateModal({
  title = "Монголд буусан огноо",
  onClose,
  onSubmit,
}: ArrivalDateModalProps) {
  const initial = parseMonthValue("");
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!year || !month) {
      setError("Он, сарыг сонгоно уу");
      return;
    }
    onSubmit(formatDateLabel(year, month, day));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Он, сар, өдөр
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Хадгалах
          </button>
        </form>
      </div>
    </div>
  );
}
