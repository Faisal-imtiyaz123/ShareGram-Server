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
exports.commentsRouter = void 0;
const db_1 = require("../db");
const z = __importStar(require("zod"));
const trpc_1 = require("../trpc");
const mongodb_1 = require("mongodb");
const server_1 = require("@trpc/server");
const miscellaneous_1 = require("../utils/miscellaneous");
exports.commentsRouter = (0, trpc_1.router)({
    fetchPostComments: trpc_1.publicProcedure.input(z.object({
        postId: z.string().min(1, { message: "postId is required" })
    })).output((postComments) => {
        return postComments;
    })
        .query((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, db_1.connectToDatabase)();
        const comments = db.collection("comments");
        const postComments = yield comments.aggregate([
            {
                $match: { postId: new mongodb_1.ObjectId(opts.input.postId) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    _id: 1,
                    postId: 1,
                    authorId: 1,
                    createdAt: 1,
                    comment: 1,
                    likes: 1,
                    updatedAt: 1,
                    'userDetails.username': 1,
                    'userDetails.profilePicture': 1
                }
            }
        ]).toArray();
        console.log(postComments);
        return postComments;
    })),
    createComment: trpc_1.publicProcedure.input(z.object({
        postId: z.string().min(1, { message: "postId is required" }),
        comment: z.string().min(1, { message: "comment is required" }),
        authorId: z.string().min(1, { message: "userId is required" }),
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, db_1.connectToDatabase)();
        const comments = db.collection("comments");
        const { postId, comment, authorId } = opts.input;
        const posts = db.collection("posts");
        const newComment = {
            postId: new mongodb_1.ObjectId(postId),
            comment,
            authorId: new mongodb_1.ObjectId(authorId),
            likes: 0,
            createdAt: (0, miscellaneous_1.getTodaysDate)(),
            updatedAt: (0, miscellaneous_1.getTodaysDate)(),
            replies: []
        };
        const result = yield comments.insertOne(newComment);
        if (result.insertedId) {
            yield posts.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $push: { comments: result.insertedId } });
        }
        else {
            throw new server_1.TRPCError({
                code: "BAD_REQUEST",
                message: "Error creating comment",
            });
        }
    })),
    deleteComment: trpc_1.publicProcedure.input(z.object({
        commentId: z.string().min(1, { message: "commentId is required" }),
        postId: z.string().min(1, { message: "postId is required" })
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const { commentId, postId } = opts.input;
        const db = yield (0, db_1.connectToDatabase)();
        const comments = db.collection("comments");
        const posts = db.collection("posts");
        const result = yield comments.deleteOne({ _id: new mongodb_1.ObjectId(commentId) });
        console.log(result);
        if (result.deletedCount) {
            yield posts.updateOne({ _id: new mongodb_1.ObjectId(postId) }, { $pull: { comments: new mongodb_1.ObjectId(commentId) } });
        }
        else {
            throw new server_1.TRPCError({
                code: "BAD_REQUEST",
                message: "Error deleting comment",
            });
        }
    }))
});
