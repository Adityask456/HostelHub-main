import mongoose from "mongoose";

const notificationReadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userid = ret.userId?.toString ? ret.userId.toString() : ret.userId;
        ret.notificationid = ret.notificationId?.toString ? ret.notificationId.toString() : ret.notificationId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationReadSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

export const NotificationRead = mongoose.model("NotificationRead", notificationReadSchema);
export default NotificationRead;
