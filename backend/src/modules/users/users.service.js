import { User } from "../../models/User.js";
import { Leave } from "../../models/Leave.js";
import { Complaint } from "../../models/Complaint.js";
import { Poll } from "../../models/Poll.js";
import bcrypt from "bcrypt";

export const listUsers = async ({ role, search, page = 1, limit = 20 }) => {
  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return { items: items.map((u) => u.toJSON()), total, page, limit };
};

export const updateMe = async ({ userId, name, roomNumber, oldPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }

  if (name && name !== user.name) {
    user.name = name;
  }

  if (roomNumber !== undefined && roomNumber !== null) {
    user.roomNumber = String(roomNumber);
  }

  if (newPassword) {
    if (!oldPassword) {
      const e = new Error("Old password is required");
      e.status = 400;
      throw e;
    }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      const e = new Error("Old password is incorrect");
      e.status = 400;
      throw e;
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  const userObj = user.toJSON();
  delete userObj.password;
  return userObj;
};

export const getStudentStats = async ({ userId }) => {
  const [pendingLeaves, activeComplaints, activePolls] = await Promise.all([
    Leave.countDocuments({ userId, status: "PENDING" }),
    Complaint.countDocuments({ userId, status: { $ne: "RESOLVED" } }),
    Poll.countDocuments({}),
  ]);

  return {
    pendingLeaves,
    activeComplaints,
    activePolls,
  };
};
