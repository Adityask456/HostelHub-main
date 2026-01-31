import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { role } from "../../middlewares/role.js";
import {
  createItem,
  listItems,
  getItemById,
  updateItem,
  deleteItem,
  markSold,
} from "./marketplace.controller.js";

const router = Router();

// Allow ADMIN to also create marketplace items
router.post("/item", auth, role("STUDENT", "ADMIN"), createItem);

router.get("/items", listItems);
router.get("/item/:id", getItemById);

// Allow ADMIN to update and mark items as sold when needed
router.put("/item/:id", auth, role("STUDENT", "ADMIN"), updateItem);
router.put("/item/:id/mark-sold", auth, role("STUDENT", "ADMIN"), markSold);


router.delete("/item/:id", auth, role("STUDENT","WARDEN"), deleteItem);

export default router;
