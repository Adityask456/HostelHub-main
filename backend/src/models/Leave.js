import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userid = ret.userId?.toString ? ret.userId.toString() : ret.userId;
        ret.fromdate = ret.fromDate;
        ret.todate = ret.toDate;
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
        ret.fromdate = ret.fromDate;
        ret.todate = ret.toDate;
        ret.createdat = ret.createdAt;
        return ret;
      },
    },
  }
);

export const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
