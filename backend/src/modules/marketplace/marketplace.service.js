import { supabaseAdmin } from "../../config/db.js";

export const createItem = async ({ userId, title, description, price }) => {
  const { data: item, error } = await supabaseAdmin
    .from("marketplaceitem")
    .insert({ userid: Number(userId), title, description, price: Number(price), status: "AVAILABLE", createdat: new Date() })
    .select("id,userid,title,description,price,status,createdat")
    .single();

  if (error) throw error;
  return item;
};

export const listItems = async ({ search, minPrice, maxPrice, status, page = 1, limit = 20 }) => {
  let query = supabaseAdmin.from("marketplaceitem").select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (minPrice !== undefined) {
    query = query.gte("price", Number(minPrice));
  }
  if (maxPrice !== undefined) {
    query = query.lte("price", Number(maxPrice));
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

export const getItemById = async ({ id }) => {
  const { data: item, error } = await supabaseAdmin
    .from("marketplaceitem")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) throw error;
  
  // Fetch user data
  const { data: user } = await supabaseAdmin.from("user").select("id,name,roomnumber,email").eq("id", item.userid).single();
  
  return {
    ...item,
    user: user || { name: "Unknown", roomnumber: null }
  };
};

export const updateItem = async ({ id, title, description, price, status }) => {
  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Number(price);
  if (status !== undefined) data.status = status;

  const { data: item, error } = await supabaseAdmin
    .from("marketplaceitem")
    .update(data)
    .eq("id", Number(id))
    .select("*")
    .single();

  if (error) throw error;
  return item;
};

export const deleteItem = async ({ id }) => {
  const { data: deleted, error } = await supabaseAdmin
    .from("marketplaceitem")
    .delete()
    .eq("id", Number(id))
    .select("id")
    .single();

  if (error) throw error;
  return deleted;
};

export const markSold = async ({ id }) => {
  const { data: item, error } = await supabaseAdmin
    .from("marketplaceitem")
    .update({ status: "SOLD" })
    .eq("id", Number(id))
    .select("*")
    .single();

  if (error) throw error;
  return item;
};
