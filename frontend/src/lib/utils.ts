import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "N/A";
  try {
    return format(new Date(date), "MMM d, yyyy");
  } catch {
    return "Invalid Date";
  }
}

export function formatRelativeTime(date: string | Date | null | undefined) {
  if (!date) return "just now";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "recently";
  }
}

export function formatMTTR(startOrMinutes: number | string | Date | undefined, endDate?: string | Date) {
  let mins: number;

  if (endDate && startOrMinutes) {
    // Called with (start, end) — calculate diff in minutes
    const start = new Date(startOrMinutes as string | Date);
    const end = new Date(endDate);
    mins = Math.round((end.getTime() - start.getTime()) / 60000);
  } else {
    mins = typeof startOrMinutes === "string" ? parseInt(startOrMinutes) : (startOrMinutes as number);
  }

  if (!mins || isNaN(mins)) return "0m";
  if (mins < 0) mins = Math.abs(mins);
  if (mins < 60) return `${mins}m`;
  return `${(mins / 60).toFixed(1)}h`;
}

