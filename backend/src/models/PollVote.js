import mongoose from "mongoose";

const pollVoteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    option: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.pollid = ret.pollId?.toString ? ret.pollId.toString() : ret.pollId;
        ret.userid = ret.userId?.toString ? ret.userId.toString() : ret.userId;
        ret.createdat = ret.createdAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.pollid = ret.pollId?.toString ? ret.pollId.toString() : ret.pollId;
        ret.userid = ret.userId?.toString ? ret.userId.toString() : ret.userId;
        ret.createdat = ret.createdAt;
        return ret;
      },
    },
  }
);

pollVoteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

export const PollVote = mongoose.model("PollVote", pollVoteSchema);
export default PollVote;
