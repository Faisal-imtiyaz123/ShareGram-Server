import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
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
    default:""
  },
  bio: {
    type: String,
    default: "",
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
privateAccount:{type:Boolean, default:false},
posts:[
  {type:mongoose.Schema.Types.ObjectId},
]

});
const User =  mongoose.model("User", userSchema);
export default User;
