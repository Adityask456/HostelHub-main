import { supabaseAdmin } from "../../config/db.js";

export const createPoll = async ({ question, options, createdBy }) => {
  const { data: poll, error } = await supabaseAdmin
    .from("poll")
    .insert({
      question,
      options: options,
      createdby: Number(createdBy),
      createdat: new Date(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return poll;
};

export const listPolls = async ({ active = true, page = 1, limit = 20, userId }) => {
  // First get all polls
  const { data: polls, count, error } = await supabaseAdmin
    .from("poll")
    .select("*", { count: "exact" })
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;

  // Then get all votes separately (avoid relationship issues)
  const { data: allVotes, error: votesError } = await supabaseAdmin
    .from("pollvote")
    .select("*");

  if (votesError) throw votesError;

  const formattedItems = (polls || []).map((poll) => {
    // Filter votes for this poll
    const pollVotes = (allVotes || []).filter((v) => v.pollid === poll.id);
    
    const voteCounts = {};
    pollVotes.forEach((v) => {
      voteCounts[v.option] = (voteCounts[v.option] || 0) + 1;
    });

    const userVote = pollVotes.find((v) => v.userid === userId)?.option;
    const hasVoted = !!userVote;

    const options = (Array.isArray(poll.options) ? poll.options : []).map((opt, index) => ({
      id: index,
      text: opt,
      votes: voteCounts[opt] || 0,
      isUserChoice: userVote === opt,
    }));

    return {
      id: poll.id,
      title: poll.question,
      description: "Cast your vote now!",
      type: "general",
      options,
      hasVoted,
      userVote,
      createdAt: poll.createdat,
    };
  });

  return { items: formattedItems, total: count || 0, page, limit };
};

export const getPollById = async ({ id }) => {
  const { data: poll, error } = await supabaseAdmin
    .from("poll")
    .select("id,question,options,createdat")
    .eq("id", Number(id))
    .single();

  if (error) throw error;
  return poll;
};

export const vote = async ({ pollId, userId, option }) => {
  const { data: poll, error: pollError } = await supabaseAdmin
    .from("poll")
    .select("options")
    .eq("id", Number(pollId))
    .single();

  if (pollError || !poll) {
    const e = new Error("Poll not found");
    e.status = 404;
    throw e;
  }

  const opts = Array.isArray(poll.options) ? poll.options : [];
  console.log(`Poll options: ${JSON.stringify(opts)}, Requested option: ${option}`);
  
  if (!opts.includes(option)) {
    const e = new Error("Invalid option");
    e.status = 400;
    throw e;
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("pollvote")
    .select()
    .eq("pollid", Number(pollId))
    .eq("userid", Number(userId))
    .single();

  if (existing) {
    const e = new Error("Already voted");
    e.status = 409;
    throw e;
  }

  const { error: voteError } = await supabaseAdmin
    .from("pollvote")
    .insert({ pollid: Number(pollId), userid: Number(userId), option, createdat: new Date() });

  if (voteError) throw voteError;
  return { success: true };
};

export const results = async ({ id }) => {
  const { data: poll, error: pollError } = await supabaseAdmin
    .from("poll")
    .select()
    .eq("id", Number(id))
    .single();

  if (pollError || !poll) {
    const e = new Error("Poll not found");
    e.status = 404;
    throw e;
  }

  const { data: votes, error: votesError } = await supabaseAdmin
    .from("pollvote")
    .select("option")
    .eq("pollid", Number(id));

  if (votesError) throw votesError;

  const counts = {};
  (votes || []).forEach((v) => {
    counts[v.option] = (counts[v.option] || 0) + 1;
  });

  return Object.entries(counts).map(([option, votes]) => ({ option, votes }));
};

export const deletePoll = async ({ id }) => {
  const { error: deleteVotesError } = await supabaseAdmin
    .from("pollvote")
    .delete()
    .eq("pollid", Number(id));

  if (deleteVotesError) throw deleteVotesError;

  const { data: deleted, error } = await supabaseAdmin
    .from("poll")
    .delete()
    .eq("id", Number(id))
    .select("*")
    .single();

  if (error) throw error;
  return deleted;
};
