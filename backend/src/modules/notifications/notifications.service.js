import { supabaseAdmin } from "../../config/db.js";
import { sendNotification } from "../../utils/notify.js";

export const listMyNotifications = async ({ userId, unreadOnly, page = 1, limit = 20 }) => {
  // Just get all notifications - the frontend will filter
  const { data: allNotifications, count, error } = await supabaseAdmin
    .from("notification")
    .select("*")
    .order("createdat", { ascending: false });

  if (error) throw error;

  // Simple filter: show if it's for this user OR if it's a broadcast (userid is null)
  const filtered = (allNotifications || []).filter((n) => {
    return n.userid === Number(userId) || n.userid === null;
  });

  // Process pagination
  const items = filtered
    .slice((page - 1) * limit, page * limit)
    .map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read || false,
      createdAt: n.createdat,
    }));

  const finalItems = unreadOnly ? items.filter((i) => !i.read) : items;

  return { items: finalItems, total: filtered.length || 0, page, limit };
};

export const sendNotifications = async ({ recipients, title, message }) => {
  // 1. Global/Role-based Notice
  if (recipients?.role && ["ALL", "STUDENT", "WARDEN", "ADMIN"].includes(recipients.role)) {
    const targetRole = recipients.role === "ALL" ? null : recipients.role;

    const { data: created, error } = await supabaseAdmin
      .from("notification")
      .insert({
        targetrole: targetRole,
        title,
        message,
        userid: null,
        createdat: new Date(),
      })
      .select();

    if (error) throw error;
    return { sentCount: 1, global: true };
  }

  // 2. Individual Notices
  const userIds = new Set();
  if (recipients?.userIds && Array.isArray(recipients.userIds)) {
    recipients.userIds.forEach((id) => userIds.add(Number(id)));
  }

  const ids = Array.from(userIds);
  if (ids.length === 0) return { sentCount: 0 };

  const records = await Promise.all(
    ids.map(async (uid) => {
      const { data: notif, error } = await supabaseAdmin
        .from("notification")
        .insert({
          userid: uid,
          title,
          message,
          createdat: new Date(),
        })
        .select("*")
        .single();

      if (error) throw error;
      return notif;
    })
  );

  // Fire-and-forget push notifications (best-effort)
  for (const rec of records) {
    if (rec.userid) {
      sendNotification(rec.userid, { title: rec.title, message: rec.message }).catch(() => {});
    }
  }

  return { sentCount: records.length };
};

export const markRead = async ({ id, userId }) => {
  const { data: notif, error: fetchError } = await supabaseAdmin
    .from("notification")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (fetchError || !notif) {
    const e = new Error("Notification not found");
    e.status = 404;
    throw e;
  }

  // If individual notice
  if (notif.userid) {
    if (notif.userid !== Number(userId)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    const { data: updated, error } = await supabaseAdmin
      .from("notification")
      .update({ read: true })
      .eq("id", Number(id))
      .select("*")
      .single();

    if (error) throw error;
    return updated;
  } else {
    // Global notice: Create a read record if not exists
    try {
      await supabaseAdmin.from("notificationread").insert({
        userid: Number(userId),
        notificationid: Number(id),
      });
    } catch (e) {
      // Ignore unique constraint violation (already read)
    }
    return { id: Number(id), read: true };
  }
};
