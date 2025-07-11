"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true,
        default: "",
    },
    image: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "",
    },
    onboarded: {
        type: Boolean,
        default: false,
    },
    //   communities: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Community",
    //     },
    //   ],
    //   followers:[
    //     {
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'User',
    //   }
    // ],
    // following:[{
    //   type:mongoose.Schema.Types.ObjectId,
    //     ref:'User',
    // }],
    // messagedUsers:[{
    //   type:mongoose.Schema.Types.ObjectId,
    //   ref:'User'
    // }],
    // requestedUsers:[{
    //   type:mongoose.Schema.Types.ObjectId,
    //   ref:'User'
    // }],
    // requestingUsers:[
    //   {
    //   type:mongoose.Schema.Types.ObjectId,
    //   ref:'User'
    //   }
    // ],
    // blockedUsers:[{
    //   type:mongoose.Schema.Types.ObjectId,
    //   ref:'User'
    // }],
    // mutedAccounts:[{
    //   type:mongoose.Schema.Types.ObjectId,
    //   ref:'User'
    // }],
    privateAccount: { type: Boolean, default: false },
    posts: [
        { type: mongoose_1.default.Schema.Types.ObjectId },
    ]
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
