import { Router } from "express";
import {
  getAllAttributeDefinitions,
  createAttributeDefinition,
  updateAttributeDefinition,
  deleteAttributeDefinition,
  createAttributeValue,
  deleteAttributeValue,
} from "../controllers/attributeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Attribute Definition CRUD
router.get("/", getAllAttributeDefinitions);
router.post("/", createAttributeDefinition);
router.put("/:id", updateAttributeDefinition);
router.delete("/:id", deleteAttributeDefinition);

// Attribute Value management
router.post("/values", createAttributeValue);
router.delete("/values/:id", deleteAttributeValue);

export default router;
