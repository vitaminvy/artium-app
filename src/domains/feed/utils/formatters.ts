/**
 * Formatting utilities for feed domain
 */

/**
 * Format duration in milliseconds to MM:SS format
 * @param durationMs - Duration in milliseconds
 * @returns Formatted string in MM:SS format, or empty string if invalid
 * @example
 * formatDuration(65000) // "1:05"
 * formatDuration(5000)  // "0:05"
 */
export const formatDuration = (durationMs?: number): string => {
  if (!durationMs) return "";
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Extract initials from a name
 * @param name - Full name (e.g., "John Doe")
 * @returns Initials in uppercase (e.g., "JD"), max 2 characters
 * @example
 * getInitials("John Doe")      // "JD"
 * getInitials("John")          // "JO"
 * getInitials()                // "YOU"
 */
export const getInitials = (name?: string): string => {
  if (!name) return "YOU";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
