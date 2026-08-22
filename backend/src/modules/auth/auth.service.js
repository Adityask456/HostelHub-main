import { User } from "../../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ENV } from "../../config/env.js";

export const register = async (data) => {
  const existing = await User.findOne({ email: data.email?.toLowerCase().trim() });
  if (existing) {
    const e = new Error("Email already registered");
    e.status = 400;
    throw e;
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email: data.email?.toLowerCase().trim(),
    password: hashed,
    role: data.role || "STUDENT",
    roomNumber: data.roomNumber || data.roomnumber || null,
  });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role || "STUDENT" },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const userObj = user.toJSON();
  delete userObj.password;

  return { ...userObj, token };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email?.toLowerCase().trim() });
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }

  return jwt.sign(
    { id: user._id.toString(), role: user.role || "STUDENT" },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const me = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return user.toJSON();
};

export const assignRole = async ({ userId, role }) => {
  const allowed = ["ADMIN", "WARDEN", "STUDENT"];
  if (!allowed.includes(role)) {
    const e = new Error("Invalid role");
    e.status = 400;
    throw e;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password");

  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }

  return user.toJSON();
};
