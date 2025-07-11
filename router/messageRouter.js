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
exports.messageRouter = void 0;
const db_1 = require("../db");
const z = __importStar(require("zod"));
const trpc_1 = require("../trpc");
const mongodb_1 = require("mongodb");
const messageUtils_1 = require("../utils/messageUtils");
const pusher_1 = require("../utils/pusher");
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const now = new Date();
const dayNum = now.getDay();
const day = days[dayNum];
exports.messageRouter = (0, trpc_1.router)({
    sendMessage: trpc_1.publicProcedure.input(z.object({
        senderId: z.string().min(1, "senderId required"),
        recieverId: z.string().min(1, "recieverId is required"),
        message: z.string().min(1, "Message is required"),
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const db = yield (0, db_1.connectToDatabase)();
        const { senderId, recieverId, message } = opts.input;
        const senderDbId = new mongodb_1.ObjectId(senderId);
        const recieverDbId = new mongodb_1.ObjectId(recieverId);
        const messageCollection = db.collection('messages');
        const usersCollection = db.collection('users');
        const newMessage = {
            senderId: senderDbId,
            receiverId: recieverDbId,
            message,
            time: {
                day: day,
                time: (0, messageUtils_1.getTime)(),
                year: now.getFullYear().toString()
            }
        };
        const insertedMsg = yield messageCollection.insertOne(newMessage);
        yield usersCollection.updateOne({ _id: senderDbId }, { $addToSet: { messageUsers: recieverDbId } });
        yield pusher_1.pusher.trigger(recieverId, 'message', {
            senderId: senderDbId.toString(),
            receiverId: recieverDbId.toString,
            message: message,
            sent: ((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data.toString()) == senderId.toString() ? true : false,
            _id: insertedMsg.insertedId.toString()
        });
        // Update the receiver's messageUsers field to include the sender's ID
        yield usersCollection.updateOne({ _id: recieverDbId }, { $addToSet: { messageUsers: senderDbId } });
    })),
    fetchMessageUsers: trpc_1.publicProcedure.output((out) => {
        return out;
    }).
        query((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const db = yield (0, db_1.connectToDatabase)();
        const senderDbId = new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data);
        const usersCollection = db.collection('users');
        const populatedUsers = yield usersCollection.aggregate([
            {
                $match: { _id: senderDbId }
            },
            {
                $lookup: {
                    from: 'users', // The collection to join with
                    localField: 'messageUsers', // The field in the current collection
                    foreignField: '_id', // The field in the joined collection
                    as: 'messageUsersDetails' // The output array field
                }
            },
            {
                $project: {
                    messageUsersDetails: {
                        _id: 1,
                        username: 1,
                        profilePhoto: 1,
                        name: 1
                    }
                }
            }
        ]).toArray();
        return populatedUsers;
    })),
    fetchMessages: trpc_1.publicProcedure.input(z.object({
        recieverId: z.string().min(1, "recieverId is required")
    }))
        .output((value) => {
        return value;
    })
        .query((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const db = yield (0, db_1.connectToDatabase)();
        const { recieverId } = opts.input;
        const senderId = new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data);
        const recieverDbId = new mongodb_1.ObjectId(recieverId);
        const messageCollection = db.collection('messages');
        const messages = yield messageCollection.find({
            $or: [
                { senderId: senderId, receiverId: recieverDbId },
                { senderId: recieverDbId, receiverId: senderId }
            ]
        }).toArray();
        return messages;
    })),
    deleteMessage: trpc_1.publicProcedure.input(z.object({
        messageId: z.string().min(1, "messageId is required"),
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const db = yield (0, db_1.connectToDatabase)();
        const { messageId } = opts.input;
        const messageCollection = db.collection('messages');
        const messageToDelete = new mongodb_1.ObjectId(messageId);
        yield messageCollection.deleteOne({ _id: messageToDelete });
        yield pusher_1.pusher.trigger('messages', 'delete-message', {
            messageId: messageId
        });
    })),
    deleteChat: trpc_1.publicProcedure.input(z.object({
        userId: z.string().min(1, { message: "User ID is required" }),
    })).mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const db = yield (0, db_1.connectToDatabase)();
        const usersCollection = db.collection('users');
        const currentUserId = new mongodb_1.ObjectId((_a = opts.ctx.user) === null || _a === void 0 ? void 0 : _a.data);
        const userId = new mongodb_1.ObjectId(opts.input.userId);
        yield usersCollection.updateOne({ _id: currentUserId }, { $pull: { messageUsers: userId } });
        // const messagesCollection = db.collection('messages'); 
        // await messagesCollection.deleteMany({
        //   $or: [
        //     { senderId: currentUserId, receiverId: userId },
        //     { senderId: userId, receiverId: currentUserId },
        //   ],
        // });
    }))
});
