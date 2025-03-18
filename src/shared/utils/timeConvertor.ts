import { format, toZonedTime } from "date-fns-tz";

export const formatToIndianTime = (utcTime: string) => {
  const zonedDate = toZonedTime(utcTime, "UTC");
  return format(zonedDate, "hh:mm a");
};
