import * as NotificationsService from "./notifications.service.js";

export const listMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    const data = await NotificationsService.listMyNotifications({
      userId,
      unreadOnly: String(unreadOnly) === "true",
      page: Number(page),
      limit: Number(limit),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const sendNotifications = async (req, res, next) => {
  try {
    const { recipients, title, message } = req.body || {};
    if (!title || !message) {
      const e = new Error("title and message are required");
      e.status = 400;
      throw e;
    }
    const result = await NotificationsService.sendNotifications({ recipients, title, message });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const updated = await NotificationsService.markRead({ id, userId });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
