import * as MessService from "./mess.service.js";

export const createMenu = async (req, res, next) => {
  try {
    const { day, breakfast, lunch, dinner } = req.body || {};
    if (!day || !breakfast || !lunch || !dinner) {
      const e = new Error("day, breakfast, lunch, dinner are required");
      e.status = 400;
      throw e;
    }
    const created = await MessService.createMenu({ day, breakfast, lunch, dinner });
    res.json(created);
  } catch (error) {
    next(error);
  }
};

export const updateMenu = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { day, breakfast, lunch, dinner } = req.body || {};
    const updated = await MessService.updateMenu({ id, day, breakfast, lunch, dinner });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await MessService.deleteMenu({ id });
    res.json(deleted);
  } catch (error) {
    next(error);
  }
};

export const listMenus = async (req, res, next) => {
  try {
    const { day, page = 1, limit = 50 } = req.query;
    const data = await MessService.listMenus({
      day,
      page: Number(page),
      limit: Number(limit),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { menuId, rating } = req.body || {};
    if (!menuId || ![1, -1].includes(Number(rating))) {
      const e = new Error("menuId and rating (1 or -1) are required");
      e.status = 400;
      throw e;
    }
    const created = await MessService.createFeedback({
      userId,
      menuId,
      rating: Number(rating),
    });
    res.json(created);
  } catch (error) {
    next(error);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const result = await MessService.analytics({ from, to });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
