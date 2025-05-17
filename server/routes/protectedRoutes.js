import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: `Selamat datang, ${req.user.role}!` });
});

export default router;