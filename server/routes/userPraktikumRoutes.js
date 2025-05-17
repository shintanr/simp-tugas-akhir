import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createUserPraktikum, getUserPraktikum, getUserPraktikumByPraktikum, inquiryPraktikum } from "../controllers/userPraktikumController.js";

const router = express.Router();

router.get("/user-praktikum", verifyToken, getUserPraktikum);
router.get("/user-praktikum/:id_praktikum", verifyToken, getUserPraktikumByPraktikum);
router.post("/user-praktikum", verifyToken, createUserPraktikum);
router.post("/user-praktikum/inquiry", verifyToken, inquiryPraktikum);

export default router;