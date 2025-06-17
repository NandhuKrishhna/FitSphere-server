"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauth2Client = void 0;
const googleapis_1 = require("googleapis");
const env_1 = require("../../shared/constants/env");
exports.oauth2Client = new googleapis_1.google.auth.OAuth2(env_1.GOOGLE_CLIENT_ID, env_1.GOOGLE_CLIENT_SECRET, 'postmessage');
