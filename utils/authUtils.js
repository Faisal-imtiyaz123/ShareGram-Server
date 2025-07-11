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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserTemplate = exports.setAuthTokenCookie = exports.generateAuthToken = exports.comparePassword = exports.hashPassword = void 0;
exports.verifyJwt = verifyJwt;
const bcrypt = __importStar(require("bcrypt")); // Install bcrypt using npm or yarn: npm install bcrypt
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = require("../config");
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltRounds = 10; // Adjust the number of rounds based on your security needs
    const hashedPassword = yield bcrypt.hash(password, saltRounds);
    return hashedPassword;
});
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt.compare(password, hashedPassword);
});
exports.comparePassword = comparePassword;
const generateAuthToken = (userId) => {
    const token = jwt.sign({ data: userId }, config_1.config.jwtSecret, { expiresIn: "1d" });
    return token;
};
exports.generateAuthToken = generateAuthToken;
function verifyJwt(token) {
    const decoded = jwt.verify(token, config_1.config.jwtSecret);
    return decoded;
}
const setAuthTokenCookie = (res, token) => {
    res.setHeader('Set-Cookie', `auth=${token}; HttpOnly; SameSite=Lax`);
};
exports.setAuthTokenCookie = setAuthTokenCookie;
const generateUserTemplate = () => {
    return {
        name: "",
        username: "",
        bio: "",
        profilePicture: "",
        followers: [],
        following: [],
        posts: [],
        messageUsers: [],
        password: "",
        onboarded: false,
        privateAccount: false,
        appUsername: ""
    };
};
exports.generateUserTemplate = generateUserTemplate;
