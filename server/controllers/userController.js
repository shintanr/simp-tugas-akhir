// controllers/userController.js
import pool from "../config/database.js";
import bcrypt from "bcryptjs";





// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", orderBy = "created_at", sortDirection = "DESC" } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const searchQuery = `%${search}%`;

    const [users] = await pool.query(
      `
      SELECT * FROM users 
      WHERE full_name LIKE ? OR email LIKE ?
      ORDER BY ${orderBy === "" ? "created_at" : orderBy} ${sortDirection === "DESC" ? "DESC" : "ASC"}
      LIMIT ? OFFSET ?
      `,
      [searchQuery, searchQuery, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) as total FROM users 
      WHERE full_name LIKE ? OR email LIKE ?
      `,
      [searchQuery, searchQuery]
    );

    res.json({
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.log("🚀 ~ getAllUsers ~ error:", error)
    res.status(500).json({ message: "Error fetching users", error });
  }
};


// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query("SELECT * FROM users WHERE id_user = ?", [id]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { full_name, nim, email, password, role, angkatan } = req.body;
    
    // Validasi input
    if (!full_name || !nim || !email || !password || !role || !angkatan) {
      return res.status(400).json({ message: "Semua field wajib diisi!" });
    }

    console.log("Validasi input berhasil");

    // Cek apakah email atau NIM sudah terdaftar
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ? OR nim = ?", [email, nim]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email atau NIM sudah terdaftar!" });
    }

    console.log("Email/NIM belum terdaftar");

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Password hashed:", hashedPassword);

    await pool.query(
      "INSERT INTO users (full_name, nim, email, password, role, angkatan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [full_name, nim, email, hashedPassword, role, angkatan]
    );

    console.log("User berhasil dibuat!");
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error); // Logging error di server
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { full_name, nim, email, role, angkatan } = req.body;
    const { id } = req.params;

    // Cek data pengguna saat ini
    const [existingUser] = await pool.query("SELECT * FROM users WHERE id_user = ?", [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = existingUser[0];
    if (
      user.full_name === full_name &&
      user.nim === nim &&
      user.email === email &&
      user.role === role &&
      user.angkatan === angkatan
    ) {
      return res.status(200).json({ message: "Data sudah terbaru!" });
    }

    await pool.query(
      "UPDATE users SET full_name = ?, nim = ?, email = ?, role = ?, angkatan = ?, updated_at = NOW() WHERE id_user = ?",
      [full_name, nim, email, role, angkatan, id]
    );
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};


// Delete a user
export const deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id_user = ?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

