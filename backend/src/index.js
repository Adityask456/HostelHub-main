import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
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
import { auth } from "./middlewares/auth.js";
import { role } from "./middlewares/role.js";
import { User } from "./models/User.js";
import { Leave } from "./models/Leave.js";
import { Complaint } from "./models/Complaint.js";
import { Poll } from "./models/Poll.js";

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Ensure MongoDB is connected before handling serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

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
  res.json({ status: "ok", database: "mongodb", time: new Date().toISOString() });
});

app.get("/api/admin/stats", auth, role("ADMIN"), async (req, res, next) => {
  try {
    const [usersCount, pendingLeaves, openComplaints, activePolls] = await Promise.all([
      User.countDocuments({}),
      Leave.countDocuments({ status: "PENDING" }),
      Complaint.countDocuments({ status: { $ne: "RESOLVED" } }),
      Poll.countDocuments({}),
    ]);
    
    res.json({ 
      users: usersCount || 0, 
      pendingLeaves: pendingLeaves || 0, 
      openComplaints: openComplaints || 0, 
      activePolls: activePolls || 0 
    });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(ENV.PORT, () => {
    console.log(`🚀 HostelHub Server running on port ${ENV.PORT}`);
  });
});

export default app;
