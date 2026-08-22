import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdby = ret.createdBy?.toString ? ret.createdBy.toString() : ret.createdBy;
        ret.createdat = ret.createdAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdby = ret.createdBy?.toString ? ret.createdBy.toString() : ret.createdBy;
        ret.createdat = ret.createdAt;
        return ret;
      },
    },
  }
);

export const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
