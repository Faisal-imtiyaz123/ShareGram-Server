"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTime = void 0;
// export const generateMessageTemplate =()=>{
//     return{
//         senderId:new ObjectId(),
//         receiverId:new ObjectId(),
//         message:"",
//         timeSent:new Date()
//     }
// }
const getTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isPM = hours >= 12; // Check if it's past noon (PM)
    // Format hours (12-hour format)
    const formattedHours = hours % 12 || 12; // Use modulo (%) for 12-hour format, handle 0 as 12
    // Format minutes with leading zero if needed
    const formattedMinutes = minutes.toString().padStart(2, '0');
    // Add AM/PM suffix
    const timeSuffix = isPM ? 'pm' : 'am';
    return `${formattedHours}:${formattedMinutes} ${timeSuffix}`;
};
exports.getTime = getTime;
