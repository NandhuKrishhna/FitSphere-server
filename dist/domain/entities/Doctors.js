"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class Doctor {
    constructor(_id, name, email, password, status = "active", role = "doctor", provider, isApproved = false, isVerified = false, isActive = true, profilePicture, createdAt, updatedAt) {
        this._id = _id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.status = status;
        this.role = role;
        this.provider = provider;
        this.isApproved = isApproved;
        this.isVerified = isVerified;
        this.isActive = isActive;
        this.profilePicture = profilePicture;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    omitPassword() {
        const _a = this, { password } = _a, rest = __rest(_a, ["password"]);
        return rest;
    }
    comparePassword(val) {
        return bcrypt_1.default.compare(val, this.password);
    }
}
exports.Doctor = Doctor;
