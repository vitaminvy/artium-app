import type { TimeZoneOption } from "./types";

export const DEFAULT_TIME_ZONE_ID = "Asia/Ho_Chi_Minh";

// OPTIMIZED: Popular timezones only (50 instead of 316)
const POPULAR_TIMEZONES = [
  // Asia Pacific (Most used)
  { id: "Asia/Ho_Chi_Minh", label: "+07:00 Asia/Ho_Chi_Minh" },
  { id: "Asia/Bangkok", label: "+07:00 Asia/Bangkok" },
  { id: "Asia/Singapore", label: "+08:00 Asia/Singapore" },
  { id: "Asia/Hong_Kong", label: "+08:00 Asia/Hong_Kong" },
  { id: "Asia/Shanghai", label: "+08:00 Asia/Shanghai" },
  { id: "Asia/Tokyo", label: "+09:00 Asia/Tokyo" },
  { id: "Asia/Seoul", label: "+09:00 Asia/Seoul" },
  { id: "Asia/Manila", label: "+08:00 Asia/Manila" },
  { id: "Asia/Jakarta", label: "+07:00 Asia/Jakarta" },
  { id: "Asia/Kuala_Lumpur", label: "+08:00 Asia/Kuala_Lumpur" },

  // South Asia
  { id: "Asia/Kolkata", label: "+05:30 Asia/Kolkata" },
  { id: "Asia/Dhaka", label: "+06:00 Asia/Dhaka" },
  { id: "Asia/Karachi", label: "+05:00 Asia/Karachi" },

  // Middle East
  { id: "Asia/Dubai", label: "+04:00 Asia/Dubai" },
  { id: "Asia/Riyadh", label: "+03:00 Asia/Riyadh" },
  { id: "Asia/Jerusalem", label: "+02:00 Asia/Jerusalem" },

  // Oceania
  { id: "Australia/Sydney", label: "+11:00 Australia/Sydney" },
  { id: "Australia/Melbourne", label: "+11:00 Australia/Melbourne" },
  { id: "Pacific/Auckland", label: "+13:00 Pacific/Auckland" },

  // Europe
  { id: "Europe/London", label: "+00:00 Europe/London" },
  { id: "Europe/Paris", label: "+01:00 Europe/Paris" },
  { id: "Europe/Berlin", label: "+01:00 Europe/Berlin" },
  { id: "Europe/Rome", label: "+01:00 Europe/Rome" },
  { id: "Europe/Madrid", label: "+01:00 Europe/Madrid" },
  { id: "Europe/Amsterdam", label: "+01:00 Europe/Amsterdam" },
  { id: "Europe/Brussels", label: "+01:00 Europe/Brussels" },
  { id: "Europe/Vienna", label: "+01:00 Europe/Vienna" },
  { id: "Europe/Stockholm", label: "+01:00 Europe/Stockholm" },
  { id: "Europe/Moscow", label: "+03:00 Europe/Moscow" },

  // Americas - North
  { id: "America/New_York", label: "-05:00 America/New_York" },
  { id: "America/Chicago", label: "-06:00 America/Chicago" },
  { id: "America/Denver", label: "-07:00 America/Denver" },
  { id: "America/Los_Angeles", label: "-08:00 America/Los_Angeles" },
  { id: "America/Toronto", label: "-05:00 America/Toronto" },
  { id: "America/Vancouver", label: "-08:00 America/Vancouver" },
  { id: "America/Mexico_City", label: "-06:00 America/Mexico_City" },

  // Americas - South
  { id: "America/Sao_Paulo", label: "-03:00 America/Sao_Paulo" },
  { id: "America/Buenos_Aires", label: "-03:00 America/Buenos_Aires" },
  { id: "America/Bogota", label: "-05:00 America/Bogota" },
  { id: "America/Lima", label: "-05:00 America/Lima" },
  { id: "America/Santiago", label: "-03:00 America/Santiago" },

  // Africa
  { id: "Africa/Cairo", label: "+02:00 Africa/Cairo" },
  { id: "Africa/Johannesburg", label: "+02:00 Africa/Johannesburg" },
  { id: "Africa/Lagos", label: "+01:00 Africa/Lagos" },
  { id: "Africa/Nairobi", label: "+03:00 Africa/Nairobi" },

  // UTC
  { id: "UTC", label: "+00:00 UTC" },
];

export const TIME_ZONE_OPTIONS: TimeZoneOption[] = POPULAR_TIMEZONES;
