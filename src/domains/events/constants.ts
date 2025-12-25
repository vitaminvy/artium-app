import { getTimeZones } from "@vvo/tzdb";
import type { TimeZoneOption } from "./types";

const formatOffset = (minutes: number) => {
  const sign = minutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const DEFAULT_TIME_ZONE_ID = "Asia/Ho_Chi_Minh";

const rawZones = getTimeZones({ includeUtc: true }).map((zone) => ({
  id: zone.name,
  label: `${formatOffset(zone.currentTimeOffsetInMinutes)} ${zone.name}`,
  offset: zone.currentTimeOffsetInMinutes,
}));

rawZones.sort((a, b) => {
  if (a.offset !== b.offset) return a.offset - b.offset;
  return a.label.localeCompare(b.label);
});

export const TIME_ZONE_OPTIONS: TimeZoneOption[] = rawZones.map(
  ({ id, label }) => ({
    id,
    label,
  })
);
