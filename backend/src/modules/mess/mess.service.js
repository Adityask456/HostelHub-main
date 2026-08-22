import { MessMenu } from "../../models/MessMenu.js";
import { MessFeedback } from "../../models/MessFeedback.js";
import mongoose from "mongoose";

export const createMenu = async ({ day, breakfast, lunch, dinner }) => {
  const menu = await MessMenu.create({ day, breakfast, lunch, dinner });
  return menu.toJSON();
};

export const updateMenu = async ({ id, day, breakfast, lunch, dinner }) => {
  const data = {};
  if (day) data.day = day;
  if (breakfast) data.breakfast = breakfast;
  if (lunch) data.lunch = lunch;
  if (dinner) data.dinner = dinner;

  const menu = await MessMenu.findByIdAndUpdate(id, data, { new: true });
  if (!menu) {
    const e = new Error("Menu not found");
    e.status = 404;
    throw e;
  }
  return menu.toJSON();
};

export const deleteMenu = async ({ id }) => {
  await MessFeedback.deleteMany({ menuId: id });
  const deleted = await MessMenu.findByIdAndDelete(id);
  if (!deleted) {
    const e = new Error("Menu not found");
    e.status = 404;
    throw e;
  }
  return deleted.toJSON();
};

export const listMenus = async ({ day, page = 1, limit = 50 }) => {
  const query = {};
  if (day) query.day = day;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    MessMenu.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    MessMenu.countDocuments(query),
  ]);

  return { items: items.map((i) => i.toJSON()), total, page, limit };
};

export const createFeedback = async ({ userId, menuId, rating }) => {
  const feedback = await MessFeedback.create({
    userId,
    menuId,
    rating: Number(rating),
  });
  return feedback.toJSON();
};

export const analytics = async ({ from, to }) => {
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  const results = await MessFeedback.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$menuId",
        count: { $sum: 1 },
        sum: { $sum: "$rating" },
      },
    },
  ]);

  return results.map((r) => ({
    menuId: r._id.toString(),
    likes: Math.round((r.count + r.sum) / 2),
    dislikes: Math.round((r.count - r.sum) / 2),
    score: r.sum,
  }));
};
