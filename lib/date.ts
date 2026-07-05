export const MONTH_OPTIONS = [
  { value: "01", label: "1 сар" },
  { value: "02", label: "2 сар" },
  { value: "03", label: "3 сар" },
  { value: "04", label: "4 сар" },
  { value: "05", label: "5 сар" },
  { value: "06", label: "6 сар" },
  { value: "07", label: "7 сар" },
  { value: "08", label: "8 сар" },
  { value: "09", label: "9 сар" },
  { value: "10", label: "10 сар" },
  { value: "11", label: "11 сар" },
  { value: "12", label: "12 сар" },
];

export function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - 2 + i);
}

export function getDefaultMonthValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function formatDateLabel(
  year: string,
  month: string,
  day?: string
): string {
  const base = `${year} оны ${Number(month)} сар`;
  if (day?.trim()) {
    return `${base}ын ${day.trim()}`;
  }
  return base;
}

export function monthValueToLabel(value: string): string {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return formatDateLabel(year, month);
}

export function parseMonthValue(value: string): { year: string; month: string } {
  const normalized = value.includes("-") ? value : getDefaultMonthValue();
  const [year, month] = normalized.split("-");
  return { year, month };
}

export function formatYearMonth(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return monthValueToLabel(`${date.getFullYear()}-${month}`);
}
