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
exports.postRouter = void 0;
const db_1 = require("../db");
const z = __importStar(require("zod"));
const trpc_1 = require("../trpc");
const mongodb_1 = require("mongodb");
const messageUtils_1 = require("../utils/messageUtils");
const server_1 = require("@trpc/server");
const removeId_1 = require("../utils/removeId");
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const now = new Date();
const dayNum = now.getDay();
const day = days[dayNum];
exports.postRouter = (0, trpc_1.router)({
    fetchPosts: trpc_1.publicProcedure.input(z.object({
        authorId: z.string().min(1, { message: "Author ID is required" }),
    })).output((data) => {
        return data;
    })
        .query((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const { authorId } = opts.input;
        const db = yield (0, db_1.connectToDatabase)();
        const postCollection = yield db.collection('posts');
        const posts = postCollection.find({ authorId: new mongodb_1.ObjectId(authorId) }).toArray();
        return posts;
    })),
    createPost: trpc_1.publicProcedure.input(z.object({
        photo: z.string().array().min(1, { message: "Atleast one image is required" }),
        text: z.string()
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { photo, text } = opts.input;
        const db = yield (0, db_1.connectToDatabase)();
        const postCollection = yield db.collection('posts');
        const users = db.collection('users');
        const newPost = {
            authorId: new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data),
            photo,
            text: text || "",
            time: {
                day: day,
                time: (0, messageUtils_1.getTime)(),
                year: now.getFullYear().toString()
            },
            comments: [],
            likes: 0,
            usersThatLiked: []
        };
        const insertedPost = yield postCollection.insertOne(newPost);
        yield users.updateOne({ _id: new mongodb_1.ObjectId((_b = opts.ctx.user) === null || _b === void 0 ? void 0 : _b.data) }, // Match user by ID
        { $push: { posts: insertedPost.insertedId } } // Add the post ID to the user's posts array
        );
    })),
    updateLikes: trpc_1.publicProcedure.input(z.object({
        increase: z.boolean(),
        postId: z.string().min(1, { message: "Post ID is required" })
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const db = yield (0, db_1.connectToDatabase)();
        const postCollection = yield db.collection('posts');
        const post = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(opts.input.postId) });
        if (!post) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: "Post not found"
            });
        }
        const postTrimmed = (0, removeId_1.removeId)(post);
        const updatedPost = Object.assign(Object.assign({}, postTrimmed), { likes: opts.input.increase ? postTrimmed.likes + 1 : postTrimmed.likes > 0 ? postTrimmed.likes - 1 : postTrimmed.likes, usersThatLiked: updateUsersThatLiked(postTrimmed.usersThatLiked, opts.input.increase, new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data)) });
        const result = yield postCollection.updateOne({ _id: new mongodb_1.ObjectId(opts.input.postId) }, { $set: updatedPost });
        if (result.modifiedCount === 0) {
            throw new server_1.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update likes, try again"
            });
        }
        // pusher.trigger('posts', 'updateLikes', opts.input.increase);
    })),
    deletePost: trpc_1.publicProcedure.input(z.object({
        postId: z.string().min(1, { message: "Post ID is required" }),
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const db = yield (0, db_1.connectToDatabase)();
        const postCollection = yield db.collection('posts');
        const users = db.collection('users');
        const post = yield postCollection.findOne({ _id: new mongodb_1.ObjectId(opts.input.postId) });
        if (!post) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: "Post not found"
            });
        }
        const result = yield postCollection.deleteOne({ _id: new mongodb_1.ObjectId(opts.input.postId) });
        if (result.deletedCount === 0) {
            throw new server_1.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to delete post, try again"
            });
        }
        yield users.updateOne({ _id: new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data) }, { $pull: { posts: new mongodb_1.ObjectId(opts.input.postId) } });
    })),
});
// fetchPostLikes:publicProcedure.input(z.object({
//     increase:z.boolean(),
//     postId:z.string().min(1,{message:"Post ID is required"})
// })).query((opts)=>{
// })
function updateUsersThatLiked(usersThatLiked, increase, userId) {
    if (increase) {
        return [...usersThatLiked, new mongodb_1.ObjectId(userId)]; // Add user ID if increasing likes
    }
    else {
        // Optionally, remove user ID if decreasing likes (implement logic here)
        return usersThatLiked.filter((userId) => userId !== userId); // Or return filtered array (implement logic)
    }
}
