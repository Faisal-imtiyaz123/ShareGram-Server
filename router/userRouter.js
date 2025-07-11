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
exports.userRouter = void 0;
const db_1 = require("../db");
const z = __importStar(require("zod"));
const authUtils_1 = require("../utils/authUtils");
const trpc_1 = require("../trpc");
const mongodb_1 = require("mongodb");
const server_1 = require("@trpc/server");
const removeId_1 = require("../utils/removeId");
exports.userRouter = (0, trpc_1.router)({
    createProfileDetails: trpc_1.publicProcedure.input(z.object({
        name: z.string().min(3, "Name is required"),
        bio: z.string().min(20, "Bio is required"),
        username: z.string().min(3, "Username is required"),
        profilePicture: z.string()
    }))
        .mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { name, bio, username } = opts.input;
        const db = yield (0, db_1.connectToDatabase)();
        const usersCollection = db.collection('users');
        const currentUser = yield usersCollection.findOne({ _id: new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data) });
        if (!currentUser) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: "User not found, login again"
            });
        }
        const currentUserTrimmed = (0, removeId_1.removeId)(currentUser);
        const userTemplate = (0, authUtils_1.generateUserTemplate)();
        const updatedUser = Object.assign(Object.assign(Object.assign({}, userTemplate), currentUserTrimmed), { name,
            bio, appUsername: username, profilePicture: opts.input.profilePicture ? opts.input.profilePicture : currentUser.profilePicture, onboarded: true });
        // Update the user in the database
        const result = yield usersCollection.updateOne({ _id: new mongodb_1.ObjectId((_b = opts.ctx.user) === null || _b === void 0 ? void 0 : _b.data) }, { $set: updatedUser });
        if (result.modifiedCount === 0) {
            throw new server_1.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update user, try again"
            });
        }
    })),
    fetchUser: trpc_1.publicProcedure.input(z.object({
        userId: z.string().min(1, { message: "UserId is required" }),
    })).output((value) => {
        return value;
    })
        .query((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, db_1.connectToDatabase)();
        const usersCollection = db.collection('users');
        const user = yield usersCollection.findOne({ _id: new mongodb_1.ObjectId(opts.input.userId) });
        if (!user) {
            throw new server_1.TRPCError({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        return user;
    })),
    fetchUsers: trpc_1.publicProcedure.output((out) => {
        return out;
    })
        .query(() => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, db_1.connectToDatabase)();
        const usersCollection = db.collection('users');
        const users = yield usersCollection.find().toArray();
        return users;
    })),
    followUser: trpc_1.publicProcedure.input(z.object({
        userId: z.string().min(1, { message: "UserId is required" }),
        followed: z.boolean()
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const db = yield (0, db_1.connectToDatabase)();
        const usersCollection = db.collection('users');
        const user = yield usersCollection.findOne({ _id: new mongodb_1.ObjectId(opts.input.userId) });
        if (!user) {
            throw new server_1.TRPCError({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        const currentUser = yield usersCollection.findOne({ _id: new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data) });
        if (!currentUser) {
            throw new server_1.TRPCError({
                code: "NOT_FOUND",
                message: "User not found, login again"
            });
        }
        if (opts.input.followed) {
            // Add current user to the followers of the target user
            yield usersCollection.updateOne({ _id: new mongodb_1.ObjectId(opts.input.userId) }, { $addToSet: { followers: currentUser._id } });
            // Add target user to the following list of the current user
            yield usersCollection.updateOne({ _id: currentUser._id }, { $addToSet: { following: user._id } });
        }
        else {
            // Remove current user from the followers of the target user
            yield usersCollection.updateOne({ _id: new mongodb_1.ObjectId(opts.input.userId) }, { $pull: { followers: currentUser._id } });
            // Remove target user from the following list of the current user
            yield usersCollection.updateOne({ _id: currentUser._id }, { $pull: { following: user._id } });
        }
    }))
});
