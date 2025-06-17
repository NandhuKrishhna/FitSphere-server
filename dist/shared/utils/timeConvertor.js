"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.formatToIndianTime = void 0;
const date_fns_tz_1 = require("date-fns-tz");
const formatToIndianTime = (utcTime) => {
    const zonedDate = (0, date_fns_tz_1.toZonedTime)(utcTime, "UTC");
    return (0, date_fns_tz_1.format)(zonedDate, "hh:mm a");
};
exports.formatToIndianTime = formatToIndianTime;
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
};
exports.formatDate = formatDate;
