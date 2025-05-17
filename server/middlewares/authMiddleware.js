import pool from "../config/database.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ================================
// MIDDLEWARE - VERIFY TOKEN
// ================================
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan di header." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).json({ message: "Token tidak valid!" });
  }
};

// ================================
// MIDDLEWARE - ADMIN ONLY
// ================================
export const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [users] = await pool.query("SELECT role FROM users WHERE id_user = ?", [userId]);

    if (users.length === 0 || users[0].role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error verifying admin", error: error.message });
  }
};

// ================================
// OPTIONAL: BLACKLIST TOKEN
// (hanya untuk logout dengan blacklist, kalau perlu)
// ================================

const blacklistedTokens = []; // Catatan: Akan hilang saat server restart

export const checkTokenBlacklist = (req, res, next) => {
  const token = req.cookies.token;

  if (blacklistedTokens.includes(token)) {
    return res.status(401).json({ message: "Token sudah tidak berlaku (blacklisted)." });
  }

  next();
};

// Tambahkan ini di logout (jika pakai blacklist):
export const logoutUser = (req, res) => {
  const token = req.cookies.token;

  if (token) {
    blacklistedTokens.push(token); // masukkan ke daftar blacklist
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logout berhasil" });
};
