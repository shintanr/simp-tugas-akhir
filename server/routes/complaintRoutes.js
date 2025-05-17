import express from "express";
import { createComplaint, updateStatusComplaint } from "../controllers/complaintController.js";

const router = express.Router();

// 🔄 Semua user bisa register tanpa perlu login sebagai admin
router.post("/complaints", createComplaint);
router.patch("/complaints/update-status/:id", updateStatusComplaint);

export default router;
