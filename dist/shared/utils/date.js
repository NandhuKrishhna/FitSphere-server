"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToISTWithOffset = exports.convertToIST = exports.generateOtpExpiration = exports.oneHourFromNow = exports.fiveMinutesAgo = exports.ONE_DAY_MS = exports.fifteenMinutesFromNow = exports.thirtyDaysFromNow = exports.oneYearFromNow = void 0;
const oneYearFromNow = () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
exports.oneYearFromNow = oneYearFromNow;
const thirtyDaysFromNow = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
exports.thirtyDaysFromNow = thirtyDaysFromNow;
const fifteenMinutesFromNow = () => new Date(Date.now() + 15 * 60 * 1000);
exports.fifteenMinutesFromNow = fifteenMinutesFromNow;
exports.ONE_DAY_MS = 24 * 60 * 60 * 1000;
const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60 * 1000);
exports.fiveMinutesAgo = fiveMinutesAgo;
const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);
exports.oneHourFromNow = oneHourFromNow;
const generateOtpExpiration = () => new Date(Date.now() + 5 * 60 * 1000);
exports.generateOtpExpiration = generateOtpExpiration;
const convertToIST = (dateTime) => {
    return new Date(new Date(dateTime).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};
exports.convertToIST = convertToIST;
const convertToISTWithOffset = (dateTime, offsetHours = 0) => {
    const istDate = (0, exports.convertToIST)(dateTime);
    return new Date(istDate.getTime() + offsetHours * 60 * 60 * 1000);
};
exports.convertToISTWithOffset = convertToISTWithOffset;
