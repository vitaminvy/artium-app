// Date parsing utilities for home domain

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const MONTH_KEY_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export type CalendarInfo = {
  month: string;
  day: string;
} | null;

/**
 * Parses a date string (ISO format or text) into calendar display info
 *
 * Supported formats:
 * - ISO: "2024-12-23" -> { month: "DEC", day: "23" }
 * - Text: "Dec 23" or "23 Dec" -> { month: "DEC", day: "23" }
 *
 * @param value - Date string to parse
 * @returns Calendar info object or null if parsing fails
 */
export function parseCalendarInfo(value?: string): CalendarInfo {
  if (!value) return null;

  // Try ISO format first (YYYY-MM-DD)
  const isoMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = String(Number(isoMatch[3])); // Remove leading zeros
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTHS[monthIndex], day };
    }
  }

  // Try text format (e.g., "Dec 23" or "23 Dec")
  const monthMatch = value.match(/[A-Za-z]{3,}/);
  const dayMatch = value.match(/\b(\d{1,2})\b/);
  if (monthMatch && dayMatch) {
    const key = monthMatch[0].slice(0, 3).toLowerCase();
    const monthIndex = MONTH_KEY_MAP[key];
    if (monthIndex !== undefined) {
      return { month: MONTHS[monthIndex], day: dayMatch[1] };
    }
  }

  return null;
}
