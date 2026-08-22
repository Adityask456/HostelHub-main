import { MarketplaceItem } from "../../models/MarketplaceItem.js";

export const createItem = async ({ userId, title, description, price }) => {
  const item = await MarketplaceItem.create({
    userId,
    title,
    description,
    price: Number(price),
    status: "AVAILABLE",
  });
  return item.toJSON();
};

export const listItems = async ({ search, minPrice, maxPrice, status, page = 1, limit = 20 }) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    MarketplaceItem.find(query)
      .populate("userId", "name roomNumber email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MarketplaceItem.countDocuments(query),
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

export const getItemById = async ({ id }) => {
  const item = await MarketplaceItem.findById(id).populate("userId", "name roomNumber email");
  if (!item) {
    const e = new Error("Item not found");
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

export const updateItem = async ({ id, title, description, price, status }) => {
  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Number(price);
  if (status !== undefined) data.status = status;

  const item = await MarketplaceItem.findByIdAndUpdate(id, data, { new: true });
  if (!item) {
    const e = new Error("Item not found");
    e.status = 404;
    throw e;
  }
  return item.toJSON();
};

export const deleteItem = async ({ id }) => {
  const deleted = await MarketplaceItem.findByIdAndDelete(id);
  if (!deleted) {
    const e = new Error("Item not found");
    e.status = 404;
    throw e;
  }
  return { success: true, id };
};

export const markSold = async ({ id }) => {
  const item = await MarketplaceItem.findByIdAndUpdate(
    id,
    { status: "SOLD" },
    { new: true }
  );
  if (!item) {
    const e = new Error("Item not found");
    e.status = 404;
    throw e;
  }
  return item.toJSON();
};
