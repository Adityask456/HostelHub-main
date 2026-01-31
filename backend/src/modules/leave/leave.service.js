import { supabaseAdmin } from "../../config/db.js";

export const apply = async ({ userId, from, to, reason }) => {
  const { data: leave, error } = await supabaseAdmin
    .from("leave")
    .insert({
      userid: Number(userId),
      fromdate: from,
      todate: to,
      reason,
      status: "PENDING",
      createdat: new Date(),
    })
    .select("id,status,fromdate,todate,createdat")
    .single();

  if (error) throw error;
  return leave;
};

export const listMyLeaves = async ({ userId, status, page = 1, limit = 20 }) => {
  let query = supabaseAdmin
    .from("leave")
    .select("id,fromdate,todate,reason,status,createdat", { count: "exact" })
    .eq("userid", Number(userId));

  if (status) {
    query = query.eq("status", status);
  }

  const { data: items, count, error } = await query
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  return { items: items || [], total: count || 0, page, limit };
};

export const listPending = async ({ page = 1, limit = 20, student, room }) => {
  // Get all pending leaves first without relationships
  let query = supabaseAdmin
    .from("leave")
    .select("*", { count: "exact" })
    .eq("status", "PENDING");

  const { data: items, count, error } = await query
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;

  // Get all users to match by name/room
  const { data: users } = await supabaseAdmin.from("user").select("*");
  const userMap = {};
  (users || []).forEach((u) => {
    userMap[u.id] = u;
  });

  // Filter in-memory by student name or room if needed
  let filtered = (items || []).map((leave) => {
    const user = userMap[leave.userid];
    return {
      ...leave,
      user: user || { name: "Unknown", roomnumber: null }
    };
  });
  
  if (student || room) {
    filtered = filtered.filter((leave) => {
      if (student && !leave.user.name.toLowerCase().includes(student.toLowerCase()))
        return false;
      if (room && leave.user.roomnumber !== Number(room)) return false;
      return true;
    });
  }

  return { items: filtered, total: count || 0, page, limit };
};

export const approve = async ({ id }) => {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("leave")
    .select()
    .eq("id", Number(id))
    .single();

  if (fetchError || !existing) {
    const e = new Error("Leave not found");
    e.status = 404;
    throw e;
  }

  const { data: updated, error } = await supabaseAdmin
    .from("leave")
    .update({ status: "APPROVED" })
    .eq("id", Number(id))
    .select("id,status,fromdate,todate,userid")
    .single();

  if (error) throw error;
  return updated;
};

export const reject = async ({ id }) => {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("leave")
    .select()
    .eq("id", Number(id))
    .single();

  if (fetchError || !existing) {
    const e = new Error("Leave not found");
    e.status = 404;
    throw e;
  }

  const { data: updated, error } = await supabaseAdmin
    .from("leave")
    .update({ status: "REJECTED" })
    .eq("id", Number(id))
    .select("id,status,fromdate,todate,userid")
    .single();

  if (error) throw error;
  return updated;
};

export const getById = async ({ id }) => {
  const { data: leave, error } = await supabaseAdmin
    .from("leave")
    .select("id,userId,fromDate,toDate,reason,status,createdAt,user(id,name,email,roomNumber)")
    .eq("id", Number(id))
    .single();

  if (error) throw error;
  return leave;
};

export const deleteLeave = async ({ id, userId }) => {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("leave")
    .select()
    .eq("id", Number(id))
    .single();

  if (fetchError || !existing) {
    const e = new Error("Leave not found");
    e.status = 404;
    throw e;
  }

  if (existing.userId !== userId) {
    const e = new Error("Forbidden");
    e.status = 403;
    throw e;
  }

  const { error } = await supabaseAdmin
    .from("leave")
    .delete()
    .eq("id", Number(id));

  if (error) throw error;
  return { success: true };
};
