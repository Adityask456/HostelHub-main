import { supabase, supabaseAdmin } from "../../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ENV } from "../../config/env.js";

export const register = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);

  const { data: created, error } = await supabaseAdmin
    .from("user")
    .insert({ ...data, password: hashed, role: data.role || "STUDENT" })
    .select();

  if (error) throw error;
  
  const user = created[0];
  const token = jwt.sign(
    { id: user.id, role: user.role || "STUDENT" },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );
  
  return { ...user, token };
};

export const login = async ({ email, password }) => {
  const { data: users, error } = await supabaseAdmin
    .from("user")
    .select("*")
    .eq("email", email);

  if (error || !users || users.length === 0) throw new Error("User not found");
  
  const user = users[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  return jwt.sign(
    { id: user.id, role: user.role || "STUDENT" },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const me = async (userId) => {
  const { data: user, error } = await supabaseAdmin
    .from("user")
    .select()
    .eq("id", userId)
    .single();

  if (error) throw error;
  return user;
};

export const assignRole = async ({ userId, role }) => {
  const allowed = ["ADMIN", "WARDEN", "STUDENT"];
  if (!allowed.includes(role)) {
    throw new Error("Invalid role");
  }

  const { data: updated, error } = await supabaseAdmin
    .from("user")
    .update({ role })
    .eq("id", Number(userId))
    .select("id,name,email,role,roomnumber,createdat")
    .single();

  if (error) throw error;
  return updated;
};
