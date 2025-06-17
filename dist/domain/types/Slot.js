"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfTodayIST = startOfTodayIST;
function startOfTodayIST() {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    now.setUTCHours(now.getUTCHours() + 5); // Adjust to IST
    now.setUTCMinutes(now.getUTCMinutes() + 30);
    return now;
}
