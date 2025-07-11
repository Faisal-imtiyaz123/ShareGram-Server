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
exports.authRouter = void 0;
const db_1 = require("../db");
const z = __importStar(require("zod"));
const authUtils_1 = require("../utils/authUtils");
const trpc_1 = require("../trpc");
const mongodb_1 = require("mongodb");
const server_1 = require("@trpc/server");
exports.authRouter = (0, trpc_1.router)({
    login: trpc_1.publicProcedure.input(z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
    }))
        .mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password } = opts.input;
        const db = yield (0, db_1.connectToDatabase)();
        const usersCollection = db.collection('users');
        const user = yield usersCollection.findOne({ username });
        if (!user) {
            throw new server_1.TRPCError({
                code: "NOT_FOUND",
                message: "Invalid username or password"
            });
        }
        const passwordMatch = yield (0, authUtils_1.comparePassword)(password, user.password);
        if (!passwordMatch) {
            throw new server_1.TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid username or password"
            });
        }
        const token = (0, authUtils_1.generateAuthToken)(user._id);
        // setAuthTokenCookie(opts.ctx.res, token);
        return {
            message: 'Login successful',
            token
        };
    })),
    signUp: trpc_1.publicProcedure.input(z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
        confirmPassword: z.string().min(1, "Confirm Password is required"),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        const { username, password } = input;
        const db = yield (0, db_1.connectToDatabase)();
        const usersCollection = db.collection('users');
        const existingUser = yield usersCollection.findOne({ username });
        if (existingUser) {
            throw new server_1.TRPCError({
                code: "BAD_REQUEST",
                message: "username is taken"
            });
        }
        // Hash the password securely before storing it
        const hashedPassword = yield (0, authUtils_1.hashPassword)(password);
        const userTemplate = (0, authUtils_1.generateUserTemplate)();
        yield usersCollection.insertOne(Object.assign(Object.assign({}, userTemplate), { username: username, password: hashedPassword }));
        return { message: 'Signup successful' };
    })),
    currentUser: trpc_1.publicProcedure.output((user) => {
        return user;
    }).
        query((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, db_1.connectToDatabase)();
        if (!opts.ctx.user)
            throw new server_1.TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        const usersCollection = db.collection('users');
        const user = yield usersCollection.findOne({ _id: new mongodb_1.ObjectId(opts.ctx.user.data) });
        if (!user) {
            throw new server_1.TRPCError({
                code: "NOT_FOUND",
                message: "User not found. Please signg up"
            });
        }
        return {
            user
        };
    })),
});
