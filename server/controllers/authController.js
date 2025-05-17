import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// ====================
// REGISTER
// ====================
export const register = async (req, res) => {
  const { full_name, email, nim, password, role, angkatan } = req.body;

  try {
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR nim = ?",
      [email, nim]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email atau NIM sudah terdaftar!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (full_name, email, nim, password, role, angkatan) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, email, nim, hashedPassword, role, angkatan]
    );

    res.status(201).json({ message: "Akun berhasil didaftarkan!" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan!", error: error.message });
  }
};

// ====================
// LOGIN
// ====================

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  console.log("🚀 ~ login ~ req.body:", req.body)

  let where = "";

  if(role === "praktikan") {
    where = " AND role IN ('admin','praktikan')";
  } else if(role === "asisten") {
    where = " AND role IN ('admin','asisten')";
  }

  try {
    const [user] = await pool.query("SELECT * FROM users WHERE email = ? " + where , [email]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    const validUser = user[0];
    const isMatch = await bcrypt.compare(password, validUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password salah!" });
    }

    const token = jwt.sign(
      { id: validUser.id_user, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // === Set token ke dalam cookie ===
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true jika sudah pakai https
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 jam
    });

    res.json({
      message: "Login berhasil!",
      user: {
        id: validUser.id_user,
        full_name: validUser.full_name,
        role: validUser.role,
        angkatan: validUser.angkatan,
        token: token,
        nim: validUser.nim,
        email: validUser.email
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan!", error: error.message });
  }
};


export const logoutUser = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Tidak ada token untuk dihapus" });
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logout berhasil" });
};


// ====================
// FORGOT PASSWORD
// ====================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("🚀 ~ forgotPassword ~ email:", email)

  try {
    const [userData] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (userData.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan!" });
    }

    const newPassword = Math.random().toString(36).slice(-8); // contoh: ab12cd34
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

    // Konfigurasi transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Bisa disesuaikan dengan layanan email-mu
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Kirim email
    await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Baru Anda",
      text: `Berikut adalah password baru Anda: ${newPassword}`,
    });

    res.status(200).json({ message: "Password baru telah dikirim ke email Anda." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan!", error: error.message });
  }
};

// ====================
// UPDATE PASSWORD
// ====================
export const updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const [userData] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (userData.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    const user = userData[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah!" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE email = ?", [hashedNewPassword, email]);

    res.status(200).json({ message: "Password berhasil diubah!" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan!", error: error.message });
  }
};

