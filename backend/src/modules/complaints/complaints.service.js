import { Complaint } from "../../models/Complaint.js";

export const createComplaint = async ({ userId, title, description }) => {
  const created = await Complaint.create({
    userId,
    title,
    description,
    status: "OPEN",
  });
  return created.toJSON();
};

export const listMyComplaints = async ({ userId, page = 1, limit = 20, status }) => {
  const query = { userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Complaint.find(query)
      .populate("userId", "name roomNumber email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(query),
  ]);

  const formatted = items.map((item) => {
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

  return { items: formatted, total, page, limit };
};

export const listComplaints = async ({ page = 1, limit = 20, status }) => {
  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Complaint.find(query)
      .populate("userId", "name roomNumber email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(query),
  ]);

  const formatted = items.map((item) => {
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

  return { items: formatted, total, page, limit };
};

export const updateComplaint = async ({ id, status }) => {
  const allowed = ["IN_PROGRESS", "RESOLVED"];
  if (!allowed.includes(status)) {
    const e = new Error("Invalid status");
    e.status = 400;
    throw e;
  }

  const updated = await Complaint.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate("userId", "name roomNumber email");

  if (!updated) {
    const e = new Error("Complaint not found");
    e.status = 404;
    throw e;
  }

  return updated.toJSON();
};

export const getComplaintById = async ({ id }) => {
  const complaint = await Complaint.findById(id).populate("userId", "name roomNumber email");
  if (!complaint) {
    const e = new Error("Complaint not found");
    e.status = 404;
    throw e;
  }

  const json = complaint.toJSON();
  json.user = complaint.userId
    ? {
        name: complaint.userId.name,
        roomnumber: complaint.userId.roomNumber,
        roomNumber: complaint.userId.roomNumber,
        email: complaint.userId.email,
      }
    : { name: "Unknown", roomnumber: null };

  return json;
};

export const deleteComplaint = async ({ id }) => {
  const deleted = await Complaint.findByIdAndDelete(id);
  if (!deleted) {
    const e = new Error("Complaint not found");
    e.status = 404;
    throw e;
  }
  return { success: true, id };
};
