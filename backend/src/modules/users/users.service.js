import { supabaseAdmin } from "../../config/db.js";
import bcrypt from "bcrypt";

export const listUsers = async ({ role, search, page = 1, limit = 20 }) => {
  let query = supabaseAdmin.from("user").select("*", { count: "exact" });

  if (role) {
    query = query.eq("role", role);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: items, count, error } = await query
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  return { items: items || [], total: count || 0, page, limit };
};

export const updateMe = async ({ userId, name, roomNumber, oldPassword, newPassword }) => {
  const { data: user, error: fetchError } = await supabaseAdmin
    .from("user")
    .select()
    .eq("id", Number(userId))
    .single();

  if (fetchError || !user) throw new Error("User not found");

  const data = {};

  if (name && name !== user.name) {
    data.name = name;
  }

  if (roomNumber !== undefined && roomNumber !== null && roomNumber !== user.roomnumber) {
    data.roomnumber = roomNumber ? Number(roomNumber) : null;
  }

  if (newPassword) {
    if (!oldPassword) {
      throw new Error("Old password is required");
    }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      throw new Error("Old password is incorrect");
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    data.password = hashed;
  }

  if (Object.keys(data).length === 0) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roomNumber: user.roomnumber,
      createdAt: user.createdat,
    };
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("user")
    .update(data)
    .eq("id", Number(userId))
    .select("*")
    .single();

  if (updateError) throw updateError;
  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    roomNumber: updated.roomnumber,
    createdAt: updated.createdat,
  };
};

export const getStudentStats = async ({ userId }) => {
  const [leavesData, complaintsData, pollsData] = await Promise.all([
    supabaseAdmin
      .from("leave")
      .select("id", { count: "exact", head: true })
      .eq("userid", Number(userId))
      .eq("status", "PENDING"),
    supabaseAdmin
      .from("complaint")
      .select("id", { count: "exact", head: true })
      .eq("userid", Number(userId))
      .neq("status", "RESOLVED"),
    supabaseAdmin.from("poll").select("id", { count: "exact", head: true }),
  ]);

  return {
    pendingLeaves: leavesData.count || 0,
    activeComplaints: complaintsData.count || 0,
    activePolls: pollsData.count || 0,
  };
};
