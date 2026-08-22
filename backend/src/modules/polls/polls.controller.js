import * as PollsService from "./polls.service.js";

export const createPoll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { question, options } = req.body || {};
    if (!question || !Array.isArray(options) || options.length < 2) {
      const e = new Error("question and at least two options are required");
      e.status = 400;
      throw e;
    }
    const created = await PollsService.createPoll({ question, options, createdBy: userId });
    res.json(created);
  } catch (error) {
    next(error);
  }
};

export const listPolls = async (req, res, next) => {
  try {
    const { active = "true", page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const data = await PollsService.listPolls({
      active: String(active) === "true",
      page: Number(page),
      limit: Number(limit),
      userId,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getPollById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const poll = await PollsService.getPollById({ id });
    res.json(poll);
  } catch (error) {
    next(error);
  }
};

export const vote = async (req, res, next) => {
  try {
    const pollId = req.params.pollId || req.params.id;
    const userId = req.user.id;
    const { option } = req.body || {};
    if (!option) {
      const e = new Error("option is required");
      e.status = 400;
      throw e;
    }
    await PollsService.vote({ pollId, userId, option });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const results = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await PollsService.results({ id });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deletePoll = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await PollsService.deletePoll({ id });
    res.json(deleted);
  } catch (error) {
    next(error);
  }
};
