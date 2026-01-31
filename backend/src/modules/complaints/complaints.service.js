import { supabaseAdmin } from "../../config/db.js";

export const createComplaint = async ({ userId, title, description }) => {
  const { data: created, error } = await supabaseAdmin
    .from("complaint")
    .insert({
      userid: Number(userId),
      title,
      description,
      status: "OPEN",
      createdat: new Date(),
    })
    .select("id,title,description,status,createdat")
    .single();

  if (error) throw error;
  return created;
};

export const listMyComplaints = async ({ userId, page = 1, limit = 20, status }) => {
  let query = supabaseAdmin
    .from("complaint")
    .select("*", { count: "exact" })
    .eq("userid", Number(userId));

  if (status) {
    query = query.eq("status", status);
  }

  const { data: items, count, error } = await query
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  
  // Fetch user data for each complaint
  const { data: users } = await supabaseAdmin.from("user").select("id,name,roomnumber,email");
  const userMap = {};
  (users || []).forEach((u) => {
    userMap[u.id] = u;
  });
  
  const itemsWithUser = (items || []).map((item) => ({
    ...item,
    user: userMap[item.userid] || { name: "Unknown", roomnumber: null }
  }));
  
  return { items: itemsWithUser, total: count || 0, page, limit };
};

export const listComplaints = async ({ page = 1, limit = 20, status }) => {
  let query = supabaseAdmin
    .from("complaint")
    .select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: items, count, error } = await query
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  
  // Fetch user data for each complaint
  const { data: users } = await supabaseAdmin.from("user").select("id,name,roomnumber");
  const userMap = {};
  (users || []).forEach((u) => {
    userMap[u.id] = u;
  });
  
  const itemsWithUser = (items || []).map((item) => ({
    ...item,
    user: userMap[item.userid] || { name: "Unknown", roomnumber: null }
  }));
  
  return { items: itemsWithUser, total: count || 0, page, limit };
};

export const updateComplaint = async ({ id, status }) => {
  const allowed = ["IN_PROGRESS", "RESOLVED"];
  if (!allowed.includes(status)) {
    const e = new Error("Invalid status");
    e.status = 400;
    throw e;
  }

  const { data: updated, error } = await supabaseAdmin
    .from("complaint")
    .update({ status })
    .eq("id", Number(id))
    .select("id,title,description,status,createdat,userid")
    .single();

  if (error) throw error;
  return updated;
};

export const getComplaintById = async ({ id }) => {
  const { data: complaint, error } = await supabaseAdmin
    .from("complaint")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) throw error;
  
  // Fetch user data
  const { data: user } = await supabaseAdmin.from("user").select("id,name,roomnumber,email").eq("id", complaint.userid).single();
  
  return {
    ...complaint,
    user: user || { name: "Unknown", roomnumber: null }
  };
};

export const deleteComplaint = async ({ id }) => {
  const { error } = await supabaseAdmin
    .from("complaint")
    .delete()
    .eq("id", Number(id));

  if (error) throw error;
  return { success: true, id: Number(id) };
};
