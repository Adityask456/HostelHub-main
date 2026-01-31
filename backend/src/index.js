import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import leaveRoutes from "./modules/leave/leave.routes.js";
import complaintsRoutes from "./modules/complaints/complaints.routes.js";
import messRoutes from "./modules/mess/mess.routes.js";
import marketplaceRoutes from "./modules/marketplace/marketplace.routes.js";
import pollsRoutes from "./modules/polls/polls.routes.js";
import lostfoundRoutes from "./modules/lostfound/lostfound.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { supabaseAdmin } from "./config/db.js";
import { auth } from "./middlewares/auth.js";
import { role } from "./middlewares/role.js";

const app = express();


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/mess", messRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/polls", pollsRoutes);
app.use("/api/lostfound", lostfoundRoutes);
app.use("/api/notifications", notificationsRoutes);


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/admin/stats", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const [usersData, leavesData, complaintsData, pollsData] = await Promise.all([
      supabaseAdmin.from("user").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("leave").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
      supabaseAdmin.from("complaint").select("id", { count: "exact", head: true }).neq("status", "RESOLVED"),
      supabaseAdmin.from("poll").select("id", { count: "exact", head: true }),
    ]);
    
    res.json({ 
      users: usersData.count || 0, 
      pendingLeaves: leavesData.count || 0, 
      openComplaints: complaintsData.count || 0, 
      activePolls: pollsData.count || 0 
    });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);


app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});
export default app;
