import { supabaseAdmin } from "../../config/db.js";

export const createMenu = async ({ day, breakfast, lunch, dinner }) => {
  const { data: menu, error } = await supabaseAdmin
    .from("messmenu")
    .insert({ day, breakfast, lunch, dinner, createdat: new Date() })
    .select("*")
    .single();

  if (error) throw error;
  return menu;
};

export const updateMenu = async ({ id, day, breakfast, lunch, dinner }) => {
  const data = {};
  if (day) data.day = day;
  if (breakfast) data.breakfast = breakfast;
  if (lunch) data.lunch = lunch;
  if (dinner) data.dinner = dinner;

  if (Object.keys(data).length === 0) {
    const { data: menu, error } = await supabaseAdmin
      .from("messmenu")
      .select("*")
      .eq("id", Number(id))
      .single();
    if (error) throw error;
    return menu;
  }

  const { data: menu, error } = await supabaseAdmin
    .from("messmenu")
    .update(data)
    .eq("id", Number(id))
    .select("*")
    .single();

  if (error) throw error;
  return menu;
};

export const deleteMenu = async ({ id }) => {
  // First delete all feedback for this menu to avoid foreign key constraint
  const { error: feedbackError } = await supabaseAdmin
    .from("messfeedback")
    .delete()
    .eq("menuid", Number(id));

  if (feedbackError) throw feedbackError;

  // Then delete the menu
  const { data: deleted, error } = await supabaseAdmin
    .from("messmenu")
    .delete()
    .eq("id", Number(id))
    .select("*")
    .single();

  if (error) throw error;
  return deleted;
};

export const listMenus = async ({ day, page = 1, limit = 50 }) => {
  let query = supabaseAdmin
    .from("messmenu")
    .select("*", { count: "exact" });

  if (day) {
    query = query.eq("day", day);
  }

  const { data: items, count, error } = await query
    .order("createdat", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  return { items: items || [], total: count || 0, page, limit };
};

export const createFeedback = async ({ userId, menuId, rating }) => {
  const { data: feedback, error } = await supabaseAdmin
    .from("messfeedback")
    .insert({ userid: Number(userId), menuid: Number(menuId), rating: Number(rating), createdat: new Date() })
    .select("*")
    .single();

  if (error) throw error;
  return feedback;
};

export const analytics = async ({ from, to }) => {
  let query = supabaseAdmin.from("messfeedback").select("menuid,rating");

  if (from) {
    query = query.gte("createdat", new Date(from).toISOString());
  }
  if (to) {
    query = query.lte("createdat", new Date(to).toISOString());
  }

  const { data: feedbacks, error } = await query;
  if (error) throw error;

  const grouped = {};
  (feedbacks || []).forEach((fb) => {
    if (!grouped[fb.menuid]) {
      grouped[fb.menuid] = { count: 0, sum: 0 };
    }
    grouped[fb.menuid].count += 1;
    grouped[fb.menuid].sum += fb.rating;
  });

  const results = Object.entries(grouped).map(([menuid, { count, sum }]) => ({
    menuId: Number(menuid),
    likes: Math.round((count + sum) / 2),
    dislikes: Math.round((count - sum) / 2),
    score: sum,
  }));

  return results;
};

