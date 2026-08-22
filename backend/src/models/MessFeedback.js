import mongoose from "mongoose";

const messFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessMenu",
      required: true,
    },
    rating: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userid = ret.userId?.toString ? ret.userId.toString() : ret.userId;
        ret.menuid = ret.menuId?.toString ? ret.menuId.toString() : ret.menuId;
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
        ret.menuid = ret.menuId?.toString ? ret.menuId.toString() : ret.menuId;
        ret.createdat = ret.createdAt;
        return ret;
      },
    },
  }
);

export const MessFeedback = mongoose.model("MessFeedback", messFeedbackSchema);
export default MessFeedback;
