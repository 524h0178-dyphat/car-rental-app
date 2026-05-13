const DATE_ONLY_LENGTH = 10;

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, DATE_ONLY_LENGTH);
}

export function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function rentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const days = Math.ceil((end - start) / 86_400_000);
  return Math.max(1, days);
}
