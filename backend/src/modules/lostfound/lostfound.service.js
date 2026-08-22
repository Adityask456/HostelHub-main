import { LostFound } from "../../models/LostFound.js";

export const report = async ({ userId, type, title, description, location }) => {
  const item = await LostFound.create({
    userId,
    type,
    title,
    description,
    location,
    resolved: false,
  });
  return item.toJSON();
};

export const list = async ({ type, resolved, page = 1, limit = 20 }) => {
  const query = {};
  if (type) query.type = type;
  if (resolved !== undefined) query.resolved = resolved;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    LostFound.find(query)
      .populate("userId", "name roomNumber email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LostFound.countDocuments(query),
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

export const resolve = async ({ id }) => {
  const item = await LostFound.findByIdAndUpdate(
    id,
    { resolved: true },
    { new: true }
  );
  if (!item) {
    const e = new Error("Record not found");
    e.status = 404;
    throw e;
  }
  return item.toJSON();
};

export const getById = async ({ id }) => {
  const item = await LostFound.findById(id).populate("userId", "name roomNumber email");
  if (!item) {
    const e = new Error("Record not found");
    e.status = 404;
    throw e;
  }

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
};

export const remove = async ({ id }) => {
  const deleted = await LostFound.findByIdAndDelete(id);
  if (!deleted) {
    const e = new Error("Record not found");
    e.status = 404;
    throw e;
  }
  return { id };
};
