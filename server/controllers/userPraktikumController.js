import pool from "../config/database.js";

export const getUserPraktikum = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { lab_id } = req.query;
    const [userPraktikum] = await pool.query(
      `SELECT praktikum.*, l.name as lab_name FROM kelompok_praktikum kp JOIN praktikum ON kp.id_praktikum = praktikum.id_praktikum JOIN labs l ON l.id = praktikum.lab_id WHERE kp.id_user = ? ${lab_id ? "AND praktikum.lab_id = ?" : ""}`,
      [id_user, lab_id]
    );
    res.json({
      message: "User praktikum found",
      data: userPraktikum,
    });
  } catch (error) {
    console.log("🚀 ~ getUserPraktikum ~ error:", error);
    res.status(500).json({ message: "Error fetching user praktikum", error });
  }
};

export const createUserPraktikum = async (req, res) => {
  try {
    const { id_praktikum, id_shift, is_asisten } = req.body;
    const id_user = req.user.id;

    // check praktikum exist
    const [praktikum] = await pool.query(
      "SELECT * FROM praktikum WHERE id_praktikum = ?",
      [id_praktikum]
    );

    if (praktikum.length === 0) {
      return res.status(404).json({ message: "Praktikum not found" });
    }

    // check user praktikum exist
    const [userPraktikum] = await pool.query(
      "SELECT * FROM kelompok_praktikum WHERE id_praktikum = ? AND id_user = ?",
      [id_praktikum, id_user]
    );

    if (userPraktikum.length > 0) {
      return res.status(400).json({ message: "User praktikum already exists" });
    }

    // check jumlah shift di kelompok praktikum apakah sudah melebihi maks dari batasan orang dari lab nya
    const [jumlahShift] = await pool.query(
      "SELECT count(*) as total FROM kelompok_praktikum WHERE id_praktikum = ? AND id_shift = ?",
      [id_praktikum, id_shift]
    );
    console.log(
      "🚀 ~ createUserPraktikum ~ praktikum[0].id_lab:",
      praktikum[0].id_lab
    );

    const [max_praktikan] = await pool.query(
      "SELECT max_praktikan FROM labs WHERE id = ?",
      [praktikum[0].lab_id]
    );
    console.log("🚀 ~ createUserPraktikum ~ max_praktikan:", max_praktikan);

    if (jumlahShift[0].total >= max_praktikan[0].max_praktikan) {
      return res
        .status(400)
        .json({ message: "Shift sudah penuh. Silahkan pilih shift lain" });
    }

    // Step 1-3: Ambil info jumlah kelompok & isi kelompok
    const [groupCounts] = await pool.query(
      `SELECT id_kelompok, COUNT(*) as total 
   FROM kelompok_praktikum 
   WHERE id_praktikum = ? AND id_shift = ? 
   GROUP BY id_kelompok`,
      [id_praktikum, id_shift]
    );

    // Step 4: Hitung jumlah kelompok
    const kelompokCount = Math.ceil(max_praktikan[0].max_praktikan / 4);

    // Step 5: Inisialisasi semua kelompok (1..kelompokCount) dengan count default 0
    const kelompokMap = {};
    for (let i = 1; i <= kelompokCount; i++) {
      kelompokMap[i] = 0;
    }

    // Isi berdasarkan query
    groupCounts.forEach((row) => {
      kelompokMap[row.id_kelompok] = row.total;
    });

    // Step 6: Cari kelompok yang masih di bawah rata-rata
    const kelompokKosong = Object.entries(kelompokMap)
      .filter(([_, total]) => total < 4) // kelompok yang belum penuh
      .map(([id]) => Number(id));

    // Step 7: Random pilih salah satu kelompok yang kosong
    let kelompok;
    if (kelompokKosong.length > 0) {
      kelompok =
        kelompokKosong[Math.floor(Math.random() * kelompokKosong.length)];
    } else {
      // Semua sudah penuh 4, cari kelompok dengan isi paling sedikit
      const min = Math.min(...Object.values(kelompokMap));
      const kelompokMin = Object.entries(kelompokMap)
        .filter(([_, total]) => total === min)
        .map(([id]) => Number(id));
      kelompok = kelompokMin[Math.floor(Math.random() * kelompokMin.length)];
    }

    await pool.query(
      "INSERT INTO kelompok_praktikum (id_user, id_praktikum, id_kelompok, id_shift, is_asisten) VALUES (?, ?, ?, ?, ?)",
      [id_user, id_praktikum, kelompok, id_shift, is_asisten === 1 ? 1 : 0]
    );
    res.json({ message: "User praktikum created successfully" });
  } catch (error) {
    console.log("🚀 ~ createUserPraktikum ~ error:", error);
    res.status(500).json({ message: "Error creating user praktikum", error });
  }
};

export const inquiryPraktikum = async (req, res) => {
  try {
    const { code } = req.body;
    const id_user = req.user.id;

    // check praktikum exist
    const [praktikum] = await pool.query(
      "SELECT * FROM praktikum WHERE code = ?",
      [code]
    );

    if (praktikum.length === 0) {
      return res.status(404).json({ message: "Praktikum not found" });
    }

    // check user praktikum exist
    const [userPraktikum] = await pool.query(
      "SELECT * FROM kelompok_praktikum WHERE id_praktikum = ? AND id_user = ?",
      [praktikum[0].id_praktikum, id_user]
    );

    if (userPraktikum.length > 0) {
      return res.status(400).json({ message: "User praktikum already exists" });
    }

    return res
      .status(200)
      .json({ message: "Praktikum found", data: praktikum[0] });
  } catch (error) {
    console.log("🚀 ~ inquiryPraktikum ~ error:", error);
    res.status(500).json({ message: "Error creating user praktikum", error });
  }
};

export const getUserPraktikumByPraktikum = async (req, res) => {
  try {
    const { id_praktikum } = req.params;
    const id_user = req.user.id;

    const [userPraktikum] = await pool.query(
      "SELECT * FROM kelompok_praktikum WHERE id_user = ? AND id_praktikum = ? LIMIT 1",
      [id_user, id_praktikum]
    );

    const [kelompok] = await pool.query("SELECT * FROM kelompok WHERE id = ?", [
      userPraktikum[0].id_kelompok,
    ]);

    const [praktikum] = await pool.query(
      "SELECT * FROM praktikum WHERE id_praktikum = ?",
      [id_praktikum]
    );

    if (userPraktikum.length === 0) {
      return res.status(404).json({ message: "User praktikum not found" });
    }

    if (userPraktikum[0].id_user !== id_user) {
      return res
        .status(403)
        .json({ message: "Forbidden: User not authorized" });
    }

    if (userPraktikum[0].id_praktikum.toString() !== id_praktikum) {
      return res
        .status(403)
        .json({ message: "Forbidden: Praktikum not authorized" });
    }

    res.json({
      message: "User praktikum found",
      data: {
        ...userPraktikum[0],
        praktikum: praktikum[0] || null,
        kelompok: kelompok[0] || null,
      },
    });
  } catch (error) {
    console.log("🚀 ~ getUserPraktikumByPraktikum ~ error:", error);
    res.status(500).json({ message: "Error fetching user praktikum", error });
  }
};
