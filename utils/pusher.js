"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pusherClient = exports.pusher = void 0;
const pusher_1 = __importDefault(require("pusher"));
const pusher_js_1 = __importDefault(require("pusher-js"));
const config_1 = require("../config");
exports.pusher = new pusher_1.default({
    appId: config_1.config.pusher.appId,
    key: config_1.config.pusher.key,
    secret: config_1.config.pusher.secret,
    cluster: config_1.config.pusher.cluster,
    useTLS: true,
});
exports.pusherClient = new pusher_js_1.default(config_1.config.pusher.key, {
    cluster: config_1.config.pusher.cluster,
});
