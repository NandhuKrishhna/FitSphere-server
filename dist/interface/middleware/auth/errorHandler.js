"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../../../shared/constants/http");
const errorHandler = (error, req, res, next) => {
    console.error(`PATH: ${req.path}, METHOD: ${req.method}, ERROR: ${error.message}`);
    res.status(http_1.INTERNAL_SERVER_ERROR).send("Internal Server Error");
};
exports.default = errorHandler;
