"use client";

import { getYearOptions, MONTH_OPTIONS } from "@/lib/date";

interface DateFieldsProps {
  year: string;
  month: string;
  day: string;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
}

export default function DateFields({
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
}: DateFieldsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        {getYearOptions().map((y) => (
          <option key={y} value={String(y)}>
            {y} он
          </option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        {MONTH_OPTIONS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        inputMode="numeric"
        value={day}
        onChange={(e) => onDayChange(e.target.value)}
        placeholder="Өдөр"
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}
