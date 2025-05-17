import express from "express";
import { createPraktikum, deletePraktikum, getAllPraktikumWithModules, getModulesByPraktikumId, getPraktikumById, updatePraktikum } from "../controllers/praktikumController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/praktikum", getAllPraktikumWithModules);
router.post("/praktikum", verifyToken, createPraktikum);
router.get("/praktikum/:id", verifyToken, getPraktikumById);
router.put("/praktikum/:id", verifyToken, updatePraktikum);
router.delete("/praktikum/:id", verifyToken, deletePraktikum);

router.get("/praktikum/prak-eldas/:prakId", getModulesByPraktikumId);

export default router;