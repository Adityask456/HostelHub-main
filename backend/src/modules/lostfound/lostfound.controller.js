import * as LostFoundService from "./lostfound.service.js";

export const report = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, title, description, location } = req.body || {};
    if (!type || !["LOST", "FOUND"].includes(type) || !title || !description || !location) {
      const e = new Error("type (LOST|FOUND), title, description, location are required");
      e.status = 400;
      throw e;
    }
    const created = await LostFoundService.report({ userId, type, title, description, location });
    res.json(created);
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const { type, resolved, page = 1, limit = 20 } = req.query;
    const data = await LostFoundService.list({
      type,
      resolved: resolved !== undefined ? String(resolved) === "true" : undefined,
      page: Number(page),
      limit: Number(limit),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const resolve = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const item = await LostFoundService.getById({ id });
    const ownerId = String(item.userId?._id || item.userId || item.userid || "");

    if (requester.role !== "WARDEN" && requester.role !== "ADMIN" && ownerId !== String(requester.id)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    const updated = await LostFoundService.resolve({ id });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const item = await LostFoundService.getById({ id });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const item = await LostFoundService.getById({ id });
    const ownerId = String(item.userId?._id || item.userId || item.userid || "");

    if (ownerId !== String(requester.id) && requester.role !== "WARDEN" && requester.role !== "ADMIN") {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    await LostFoundService.remove({ id });
    res.json({ id });
  } catch (error) {
    next(error);
  }
};
