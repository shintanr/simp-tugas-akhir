import express from "express";
import { getAllLabs, getPraktikumByLabId } from "../controllers/labController.js";

const router = express.Router();

router.get("/lab", getAllLabs);
router.get("/lab/lab-rpl/:labId", getPraktikumByLabId);
router.get("/lab/lab-sister/:labId", getPraktikumByLabId);

export default router;