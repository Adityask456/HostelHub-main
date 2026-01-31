import { supabaseAdmin } from "../../config/db.js";

export const report = async ({ userId, type, title, description, location }) => {
  const { data: report, error } = await supabaseAdmin
    .from("lostfound")
    .insert({
      userid: Number(userId),
      type,
      title,
      description,
      location,
      resolved: false,
      createdat: new Date(),
    })
    .select("id,userid,type,title,description,location,resolved,createdat")
    .single();

  if (error) throw error;
  return report;
};

export const list = async ({ type, resolved, page = 1, limit = 20 }) => {
  let query = supabaseAdmin
    .from("lostfound")
    .select("*", { count: "exact" });

  if (type) {
    query = query.eq("type", type);
  }
  if (resolved !== undefined) {
    query = query.eq("resolved", resolved);
  }

  const { data: items, count, error } = await query
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  
  // Fetch user data for each item
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

export const resolve = async ({ id }) => {
  const { data: report, error } = await supabaseAdmin
    .from("lostfound")
    .update({ resolved: true })
    .eq("id", Number(id))
    .select("id,userid,type,title,description,location,resolved,createdat")
    .single();

  if (error) throw error;
  return report;
};

export const getById = async ({ id }) => {
  const { data: report, error } = await supabaseAdmin
    .from("lostfound")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) throw error;
  
  // Fetch user data
    const { data: user } = await supabaseAdmin.from("user").select("id,name,roomnumber,email").eq("id", report.userid).single();
  
  return {
    ...report,
    user: user || { name: "Unknown", roomnumber: null }
  };
};

export const remove = async ({ id }) => {
  const { data: deleted, error } = await supabaseAdmin
    .from("lostfound")
    .delete()
    .eq("id", Number(id))
    .select("id")
    .single();

  if (error) throw error;
  return deleted;
};
