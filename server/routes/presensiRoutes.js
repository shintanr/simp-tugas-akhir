import express from "express";
import { getAllPresensi, getPresensiById, getPresensiByModuleId, getPresensiShiftById, createPresensi, updatePresensi, deletePresensi, getPresensiSummaryByPraktikum, getPresensiSummary } from "../controllers/presensiController.js";

const router = express.Router();

// Rute presensi
router.get("/presensi/", getAllPresensi);
router.get("/presensi/:id", getPresensiById);

router.get("/presensi/module/:id_modul", getPresensiByModuleId);
router.get("/presensi/shift/:id", getPresensiShiftById);

router.post("/presensi/", createPresensi);
router.put("/presensi/:id", updatePresensi);
router.delete("/presensi/:id", deletePresensi);

router.get("/presensi-summary", getPresensiSummary);
router.get("/presensi/summary/:id_praktikum", getPresensiSummaryByPraktikum);

export default router;
