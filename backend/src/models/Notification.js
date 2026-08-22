import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means broadcast / role-based
    },
    targetRole: {
      type: String,
      enum: ["ALL", "STUDENT", "WARDEN", "ADMIN", null],
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userid = ret.userId?.toString ? ret.userId.toString() : ret.userId;
        ret.targetrole = ret.targetRole;
        ret.createdat = ret.createdAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userid = ret.userId?.toString ? ret.userId.toString() : ret.userId;
        ret.targetrole = ret.targetRole;
        ret.createdat = ret.createdAt;
        return ret;
      },
    },
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
