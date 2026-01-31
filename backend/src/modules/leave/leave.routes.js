import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { role } from "../../middlewares/role.js";
import {
  applyLeave,
  getMyLeaves,
  listPending,
  approveLeave,
  rejectLeave,
  getById,
  deleteLeave,
} from "./leave.controller.js";

const router = Router();


// Allow ADMIN to also apply for leaves and view their own leaves
router.post("/apply", auth, role("STUDENT", "ADMIN"), applyLeave);
router.get("/my-leaves", auth, role("STUDENT", "ADMIN"), getMyLeaves);
router.delete("/:id", auth, role("STUDENT", "ADMIN"), deleteLeave);


router.get("/pending", auth, role("WARDEN"), listPending);
router.put("/approve/:id", auth, role("WARDEN"), approveLeave);
router.put("/reject/:id", auth, role("WARDEN"), rejectLeave);


router.get("/:id", auth, getById);

export default router;
