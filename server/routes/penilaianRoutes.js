// routes/penilaianRoutes.mjs
import express from 'express';
import {
    createPenilaian,
    getPenilaian,
    deletePenilaian,
    updatePenilaian,
    getPenilaianById
} from '../controllers/penilaianController.js';

const router = express.Router();

// Routes
router.post('/', createPenilaian);
router.put('/:id', updatePenilaian);
router.get('/', getPenilaian);
router.get('/:id', getPenilaianById);
router.delete('/:id', deletePenilaian);

export default router;
