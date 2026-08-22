import { Poll } from "../../models/Poll.js";
import { PollVote } from "../../models/PollVote.js";

export const createPoll = async ({ question, options, createdBy }) => {
  const poll = await Poll.create({
    question,
    options,
    createdBy,
  });
  return poll.toJSON();
};

export const listPolls = async ({ active = true, page = 1, limit = 20, userId }) => {
  const skip = (page - 1) * limit;
  const [polls, total, allVotes] = await Promise.all([
    Poll.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Poll.countDocuments(),
    PollVote.find(),
  ]);

  const formattedItems = polls.map((poll) => {
    const pollVotes = allVotes.filter((v) => String(v.pollId) === String(poll._id));

    const voteCounts = {};
    pollVotes.forEach((v) => {
      voteCounts[v.option] = (voteCounts[v.option] || 0) + 1;
    });

    const userVote = pollVotes.find((v) => String(v.userId) === String(userId))?.option;
    const hasVoted = !!userVote;

    const options = (Array.isArray(poll.options) ? poll.options : []).map((opt, index) => ({
      id: index,
      text: opt,
      votes: voteCounts[opt] || 0,
      isUserChoice: userVote === opt,
    }));

    return {
      id: poll._id.toString(),
      title: poll.question,
      description: "Cast your vote now!",
      type: "general",
      options,
      hasVoted,
      userVote,
      createdAt: poll.createdAt,
    };
  });

  return { items: formattedItems, total, page, limit };
};

export const getPollById = async ({ id }) => {
  const poll = await Poll.findById(id);
  if (!poll) {
    const e = new Error("Poll not found");
    e.status = 404;
    throw e;
  }
  return poll.toJSON();
};

export const vote = async ({ pollId, userId, option }) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    const e = new Error("Poll not found");
    e.status = 404;
    throw e;
  }

  const opts = Array.isArray(poll.options) ? poll.options : [];
  if (!opts.includes(option)) {
    const e = new Error("Invalid option");
    e.status = 400;
    throw e;
  }

  const existing = await PollVote.findOne({ pollId, userId });
  if (existing) {
    const e = new Error("Already voted");
    e.status = 409;
    throw e;
  }

  await PollVote.create({ pollId, userId, option });
  return { success: true };
};

export const results = async ({ id }) => {
  const poll = await Poll.findById(id);
  if (!poll) {
    const e = new Error("Poll not found");
    e.status = 404;
    throw e;
  }

  const votes = await PollVote.find({ pollId: id });
  const counts = {};
  votes.forEach((v) => {
    counts[v.option] = (counts[v.option] || 0) + 1;
  });

  return Object.entries(counts).map(([option, votes]) => ({ option, votes }));
};

export const deletePoll = async ({ id }) => {
  await PollVote.deleteMany({ pollId: id });
  const deleted = await Poll.findByIdAndDelete(id);
  if (!deleted) {
    const e = new Error("Poll not found");
    e.status = 404;
    throw e;
  }
  return deleted.toJSON();
};
