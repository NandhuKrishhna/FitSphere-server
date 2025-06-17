"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = __importDefault(require("typedi"));
const AppController_1 = require("../../controllers/Feat/AppController");
const notificationRouter = (0, express_1.Router)();
const notificationController = typedi_1.default.get(AppController_1.AppController);
notificationRouter.get("/", notificationController.getNotificationsHandler);
exports.default = notificationRouter;
