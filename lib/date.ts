export function getDefaultMonthValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function monthValueToLabel(value: string): string {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return `${year} оны ${Number(month)} сар`;
}

export function formatYearMonth(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return monthValueToLabel(`${date.getFullYear()}-${month}`);
}
