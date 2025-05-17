// Ini adalah route untuk user
import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();



  router.get("/api/me", verifyToken, (req, res) => {
    console.log("Token dari client:", req.cookies.token);
    console.log("Decoded user:", req.user);
    res.json({ user: req.user });
  });

// Pastikan urutan middleware benar: verifyToken dulu, baru verifyAdmin
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/users/:id", verifyToken, getUserById);
router.post("/users", verifyToken, verifyAdmin, createUser);
router.put("/users/:id", verifyToken, verifyAdmin, updateUser);
router.delete("/users/:id", verifyToken, verifyAdmin, deleteUser);



export default router;
