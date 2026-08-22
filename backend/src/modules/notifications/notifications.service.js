import { Notification } from "../../models/Notification.js";
import { NotificationRead } from "../../models/NotificationRead.js";
import { sendNotification } from "../../utils/notify.js";

export const listMyNotifications = async ({ userId, unreadOnly, page = 1, limit = 20 }) => {
  // Find notifications specific to this user OR global notices (userId is null)
  const allNotifications = await Notification.find({
    $or: [{ userId }, { userId: null }],
  }).sort({ createdAt: -1 });

  // Get read status for global notices
  const readRecords = await NotificationRead.find({ userId });
  const readSet = new Set(readRecords.map((r) => r.notificationId.toString()));

  const items = allNotifications.map((n) => {
    const isGlobal = !n.userId;
    const isRead = isGlobal ? readSet.has(n._id.toString()) : n.read;

    return {
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      read: isRead || false,
      createdAt: n.createdAt,
    };
  });

  const filtered = unreadOnly ? items.filter((i) => !i.read) : items;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return { items: paginated, total: filtered.length, page, limit };
};

export const sendNotifications = async ({ recipients, title, message }) => {
  // 1. Global / Role-based Notice
  if (recipients?.role && ["ALL", "STUDENT", "WARDEN", "ADMIN"].includes(recipients.role)) {
    const targetRole = recipients.role === "ALL" ? null : recipients.role;

    await Notification.create({
      targetRole,
      title,
      message,
      userId: null,
    });

    return { sentCount: 1, global: true };
  }

  // 2. Individual Notices
  const userIds = new Set();
  if (recipients?.userIds && Array.isArray(recipients.userIds)) {
    recipients.userIds.forEach((id) => userIds.add(String(id)));
  }

  const ids = Array.from(userIds);
  if (ids.length === 0) return { sentCount: 0 };

  const records = await Promise.all(
    ids.map(async (uid) => {
      const notif = await Notification.create({
        userId: uid,
        title,
        message,
      });
      return notif;
    })
  );

  // Best-effort push notification
  for (const rec of records) {
    if (rec.userId) {
      sendNotification(rec.userId, { title: rec.title, message: rec.message }).catch(() => {});
    }
  }

  return { sentCount: records.length };
};

export const markRead = async ({ id, userId }) => {
  const notif = await Notification.findById(id);
  if (!notif) {
    const e = new Error("Notification not found");
    e.status = 404;
    throw e;
  }

  if (notif.userId) {
    if (String(notif.userId) !== String(userId)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    notif.read = true;
    await notif.save();
    return notif.toJSON();
  } else {
    // Global notice
    try {
      await NotificationRead.create({ userId, notificationId: id });
    } catch (e) {
      // Ignore if already marked read
    }
    return { id, read: true };
  }
};
