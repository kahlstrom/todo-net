import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes.
 * Combines clsx for conditional classes with tailwind-merge
 * to properly handle conflicting Tailwind classes.
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a readable string.
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date for input fields (YYYY-MM-DD).
 *
 * @param date - Date to format
 * @returns Formatted date string for input
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Checks if a date is in the past.
 *
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPastDue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

/**
 * Gets priority color class from priority number.
 *
 * @param priority - Priority number (1-3)
 * @returns Tailwind color class
 */
export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1:
      return "text-emerald-400";
    case 2:
      return "text-amber-400";
    case 3:
      return "text-rose-400";
    default:
      return "text-muted-foreground";
  }
}
