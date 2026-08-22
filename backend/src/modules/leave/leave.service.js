import { Leave } from "../../models/Leave.js";

export const apply = async ({ userId, from, to, reason }) => {
  const leave = await Leave.create({
    userId,
    fromDate: from,
    toDate: to,
    reason,
    status: "PENDING",
  });
  return leave.toJSON();
};

export const listMyLeaves = async ({ userId, status, page = 1, limit = 20 }) => {
  const query = { userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Leave.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Leave.countDocuments(query),
  ]);

  return { items: items.map((i) => i.toJSON()), total, page, limit };
};

export const listPending = async ({ page = 1, limit = 20, student, room }) => {
  const query = { status: "PENDING" };

  const items = await Leave.find(query)
    .populate("userId", "name roomNumber email")
    .sort({ createdAt: -1 });

  let filtered = items.map((item) => {
    const json = item.toJSON();
    json.user = item.userId
      ? {
          name: item.userId.name,
          roomnumber: item.userId.roomNumber,
          roomNumber: item.userId.roomNumber,
          email: item.userId.email,
        }
      : { name: "Unknown", roomnumber: null };
    return json;
  });

  if (student || room) {
    filtered = filtered.filter((leave) => {
      if (student && !leave.user.name.toLowerCase().includes(student.toLowerCase())) {
        return false;
      }
      if (room && String(leave.user.roomNumber || leave.user.roomnumber) !== String(room)) {
        return false;
      }
      return true;
    });
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return { items: paginated, total, page, limit };
};

export const approve = async ({ id, approverId }) => {
  const updated = await Leave.findByIdAndUpdate(
    id,
    { status: "APPROVED", approverId },
    { new: true }
  );

  if (!updated) {
    const e = new Error("Leave not found");
    e.status = 404;
    throw e;
  }

  return updated.toJSON();
};

export const reject = async ({ id, approverId }) => {
  const updated = await Leave.findByIdAndUpdate(
    id,
    { status: "REJECTED", approverId },
    { new: true }
  );

  if (!updated) {
    const e = new Error("Leave not found");
    e.status = 404;
    throw e;
  }

  return updated.toJSON();
};

export const getById = async ({ id }) => {
  const leave = await Leave.findById(id).populate("userId", "name roomNumber email");
  if (!leave) {
    const e = new Error("Leave not found");
    e.status = 404;
    throw e;
  }

  const json = leave.toJSON();
  json.user = leave.userId
    ? {
        name: leave.userId.name,
        roomnumber: leave.userId.roomNumber,
        roomNumber: leave.userId.roomNumber,
        email: leave.userId.email,
      }
    : { name: "Unknown", roomnumber: null };

  return json;
};

export const deleteLeave = async ({ id, userId }) => {
  const existing = await Leave.findById(id);
  if (!existing) {
    const e = new Error("Leave not found");
    e.status = 404;
    throw e;
  }

  if (String(existing.userId) !== String(userId)) {
    const e = new Error("Forbidden");
    e.status = 403;
    throw e;
  }

  await Leave.findByIdAndDelete(id);
  return { success: true };
};
