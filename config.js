"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// config.ts
const dotenv = __importStar(require("dotenv"));
// ✅ Load .env from server/.env using absolute path
const path_1 = __importDefault(require("path"));
dotenv.config({ path: path_1.default.resolve(__dirname, ".env") });
function getEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`❌ Missing environment variable: ${name}`);
    }
    return value;
}
exports.config = {
    mongoUrl: getEnv("MONGO_URL"),
    jwtSecret: getEnv("SECRET"),
    pusher: {
        appId: getEnv("PUSHER_APP_ID"),
        key: getEnv("PUSHER_KEY"),
        secret: getEnv("PUSHER_SECRET"),
        cluster: getEnv("PUSHER_CLUSTER"),
    },
};
