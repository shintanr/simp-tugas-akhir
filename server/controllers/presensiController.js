import db from "../config/database.js"; // Pastikan path ini sesuai dengan lokasi config database

// ✅ Ambil semua presensi
export const getAllPresensi = async (req, res) => {
  try {
    const { id_user, id_praktikum, id_modul, id_shift, order_by, sort } =
      req.query;

    let filterIdModul = "";
    if (id_modul) {
      filterIdModul = `AND p.id_modul = ${id_modul}`;
    }

    let query = "";
    if (!id_user) {
      query = `
        SELECT 
          p.id,
          kp.id_user,
          kp.id_praktikum,
          kp.id_shift,
          kp.is_asisten,
          p.id_modul,
          p.status,
          p.waktu_presensi,
          u.full_name AS nama_user,
          u.nim,
          praktikum.name AS nama_praktikum,
          modul_eldas.judul_modul AS nama_modul,
          shift.nama_shift,
          kelompok.nama_kelompok,
          c.id AS id_complaint,
          c.description AS komplain,
          c.status AS status_komplain
        FROM kelompok_praktikum kp 
        LEFT JOIN presensi p ON kp.id_user = p.id_user AND kp.id_praktikum = p.id_praktikum ${filterIdModul}
        LEFT JOIN users u ON kp.id_user = u.id_user
        LEFT JOIN praktikum ON kp.id_praktikum = praktikum.id_praktikum
        LEFT JOIN modul_eldas ON p.id_modul = modul_eldas.id_modul
        LEFT JOIN shift ON kp.id_shift = shift.id_shift
        LEFT JOIN kelompok ON kp.id_kelompok = kelompok.id
        LEFT JOIN complaints c ON c.reference_type = 'presensi' AND c.reference_id = p.id
        WHERE 1=1 AND kp.is_asisten != 1
      `;
    } else {
      query = `
        SELECT 
          p.id,
          kp.id_user,
          kp.id_praktikum,
          kp.id_shift,
          kp.is_asisten,
          modul_eldas.id_modul,
          p.status,
          p.waktu_presensi,
          u.full_name AS nama_user,
          u.nim,
          praktikum.name AS nama_praktikum,
          modul_eldas.judul_modul AS nama_modul,
          shift.nama_shift,
          kelompok.nama_kelompok,
          c.id AS id_complaint,
          c.description AS komplain,
          c.status AS status_komplain
        FROM modul_eldas
        LEFT JOIN praktikum ON modul_eldas.id_praktikum = praktikum.id_praktikum
        LEFT JOIN kelompok_praktikum kp ON kp.id_praktikum = praktikum.id_praktikum 
        LEFT JOIN presensi p ON kp.id_user = p.id_user AND kp.id_praktikum = p.id_praktikum AND p.id_modul = modul_eldas.id_modul
        LEFT JOIN users u ON kp.id_user = u.id_user
        LEFT JOIN shift ON kp.id_shift = shift.id_shift
        LEFT JOIN kelompok ON kp.id_kelompok = kelompok.id
        LEFT JOIN complaints c ON c.reference_type = 'presensi' AND c.reference_id = p.id
        WHERE 1=1 AND kp.is_asisten != 1
      `;
    }

    const params = [];

    if (id_user) {
      query += ` AND kp.id_user = ?`;
      params.push(id_user);
    }

    if (id_praktikum) {
      query += ` AND kp.id_praktikum = ?`;
      params.push(id_praktikum);
    }

    if (id_modul) {
      query += ` AND (p.id_modul = ? OR p.id_modul IS NULL)`;
      params.push(id_modul);
    }

    if (id_shift) {
      query += ` AND kp.id_shift = ?`;
      params.push(id_shift);
    }

    const validOrderBy = [
      "id_user",
      "nim",
      "id_praktikum",
      "id_modul",
      "id_shift",
      "tanggal",
    ];
    const validSort = ["asc", "desc"];

    if (order_by && validOrderBy.includes(order_by)) {
      const sortOrder = validSort.includes(sort?.toLowerCase())
        ? sort.toUpperCase()
        : "ASC";
      query += ` ORDER BY ${order_by} ${sortOrder}`;
    }
    console.log("🚀 ~ getAllPresensi ~ query:", query);

    const [rows] = await db.query(query, params);

    res.status(200).json({
      message: "Berhasil mengambil data presensi",
      data: rows,
    });
  } catch (error) {
    console.log("🚀 ~ getAllPresensi ~ error:", error);
    res.status(500).json({ message: "Gagal mengambil data presensi", error });
  }
};

// ✅ Ambil presensi berdasarkan ID
export const getPresensiById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM presensi WHERE id = ?", [id]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Presensi tidak ditemukan" });

    res.status(200).json({
      message: "Berhasil mengambil data presensi",
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil presensi", error });
  }
};

// ambil presensi semua presensi pada shift tertentu
export const getPresensiByModuleId = async (req, res) => {
  try {
    const { id_modul } = req.params; // Ambil id_modul dari parameter URL
    const [rows] = await db.query(
      `
            SELECT id, id_user, id_praktikum, id_modul, id_shift, status, waktu_presensi
            FROM presensi
            WHERE id_modul = ?
        `,
      [id_modul]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada presensi untuk modul ini" });
    }

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data presensi", error });
  }
};

// ✅ Ambil presensi berdasarkan ID Shift
// ✅ Ambil presensi berdasarkan ID Shift tanpa JOIN
export const getPresensiShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `
            SELECT * FROM presensi WHERE id_shift = ?
        `,
      [id]
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ message: "Tidak ada presensi untuk shift ini" });

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil presensi", error });
  }
};

// ✅ Tambah presensi baru
export const createPresensi = async (req, res) => {
  try {
    const { id_user, id_praktikum, id_modul, id_shift, status } = req.body;

    // Validasi input (Pastikan semua field diisi)
    if (!id_user || !id_praktikum || !id_modul || !id_shift || !status) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Validasi ENUM status (Pastikan hanya menerima 'Hadir', 'Izin', atau 'alpha')
    const validStatuses = ["Hadir", "Izin", "Alpha", "Belum Hadir", "Telat"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    // check kelompok praktikum
    const [userPraktikum] = await db.query(
      "SELECT * FROM kelompok_praktikum WHERE id_user = ? AND id_praktikum = ?",
      [id_user, id_praktikum]
    );
    if (userPraktikum.length === 0) {
      return res
        .status(404)
        .json({ message: "User praktikum tidak ditemukan" });
    }

    // check jika id modul bukan milik id praktikum tidak berelasi antara tabel praktikum dan modul_eldas
    const [modulPraktikum] = await db.query(
      "SELECT * FROM modul_eldas WHERE id_modul = ? AND id_praktikum = ?",
      [id_modul, id_praktikum]
    );
    if (modulPraktikum.length === 0) {
      return res
        .status(404)
        .json({ message: "Modul praktikum tidak ditemukan" });
    }

    // check jika presensi sudah ada maka update status sesuai request
    const [existingPresensi] = await db.query(
      "SELECT * FROM presensi WHERE id_user = ? AND id_praktikum = ? AND id_modul = ? AND id_shift = ?",
      [id_user, id_praktikum, id_modul, id_shift]
    );
    console.log("🚀 ~ createPresensi ~ existingPresensi:", existingPresensi);

    let query = "";
    let message = "";
    if (existingPresensi.length > 0) {
      query = `
                UPDATE presensi SET status = ? WHERE id = ?
            `;
      message = "Presensi berhasil diperbarui";
      await db.execute(query, [status, existingPresensi[0].id]);
    } else {
      query = `
            INSERT INTO presensi (id_user, id_praktikum, id_modul, id_shift, status) 
            VALUES (?, ?, ?, ?, ?)
        `;
      message = "Presensi berhasil ditambahkan";
      await db.execute(query, [
        id_user,
        id_praktikum,
        id_modul,
        id_shift,
        status,
      ]);
    }

    return res.status(200).json({ message: message });
  } catch (error) {
    console.error("Error saat menambahkan presensi:", error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan presensi", error: error.message });
  }
};

// ✅ Perbarui presensi
export const updatePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_user, id_praktikum, id_modul, id_shift, status } = req.body;

    // Validasi input tidak boleh kosong atau null
    if (!id_user || !id_praktikum || !id_modul || !id_shift || !status) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Periksa apakah presensi dengan ID tersebut ada
    const [existingPresensi] = await db.execute(
      "SELECT * FROM presensi WHERE id = ?",
      [id]
    );

    if (existingPresensi.length === 0) {
      return res.status(404).json({ message: "Presensi tidak ditemukan" });
    }

    // Cek apakah data yang dikirim sama dengan data yang ada
    const existingData = existingPresensi[0];
    if (
      existingData.id_user === id_user &&
      existingData.id_praktikum === id_praktikum &&
      existingData.id_modul === id_modul &&
      existingData.id_shift === id_shift &&
      existingData.status === status
    ) {
      return res
        .status(200)
        .json({ message: "Tidak ada perubahan data, presensi sudah terbaru" });
    }

    // Lakukan update jika ada perubahan
    await db.execute(
      "UPDATE presensi SET id_user = ?, id_praktikum = ?, id_modul = ?, id_shift = ?, status = ? WHERE id = ?",
      [id_user, id_praktikum, id_modul, id_shift, status, id]
    );

    res.status(200).json({ message: "Presensi berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui presensi:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui presensi", error: error.message });
  }
};

// ✅ Hapus presensi
export const deletePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM presensi WHERE id = ?", [id]);

    res.status(200).json({ message: "Presensi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus presensi", error });
  }
};

// summary
export const getPresensiSummary = async (req, res) => {
  try {
    const { id_shift, id_praktikum, id_modul, id_user } = req.query;

    // if (!id_shift || !id_praktikum || !id_modul) {
    //   return res.status(400).json({
    //     message: "id_shift, id_praktikum, dan id_modul harus disediakan",
    //   });
    // }

    let total_praktikan = 0;
    let belum_hadir = 0;
    let presensiData = {
      hadir: 0,
      telat: 0,
      alpha: 0,
      izin: 0,
    };

    if (id_user) {
      // Hitung apakah user belum hadir (belum ada data presensi)
      const [[{ belum }]] = await db.query(
        `SELECT COUNT(*) AS belum
           FROM modul_eldas me
           WHERE me.id_praktikum = ?
           AND NOT EXISTS (
             SELECT 1 FROM presensi p
             WHERE p.id_user = ?
               AND p.id_praktikum = me.id_praktikum
               AND p.id_modul = me.id_modul
               AND p.status NOT IN('Belum Hadir') 
           )`,
        [id_praktikum, id_user]
      );

      belum_hadir = belum;

      total_praktikan = 1;

      // Ambil data presensi user tersebut
      const [[data]] = await db.query(
        `SELECT
            COUNT(CASE WHEN p.status = 'hadir' THEN 1 END) AS hadir,
            COUNT(CASE WHEN p.status = 'telat' THEN 1 END) AS telat,
            COUNT(CASE WHEN p.status = 'izin' THEN 1 END) AS izin
            COUNT(CASE WHEN p.status = 'alpha' THEN 1 END) AS alpha,
            COUNT(CASE WHEN p.status = 'belum hadir' THEN 1 END) AS belum_hadir
          FROM presensi p
          WHERE p.id_praktikum = ? AND p.id_user = ?`,
        [id_praktikum, id_user]
      );
      presensiData = data;
    } else {
      // Jika tanpa id_user, ambil total praktikan & summary semua
      const [[{ total_praktikan: total }]] = await db.query(
        `SELECT COUNT(*) AS total_praktikan 
           FROM kelompok_praktikum 
           WHERE id_shift = ? AND id_praktikum = ? AND is_asisten != 1`,
        [id_shift, id_praktikum]
      );
      total_praktikan = total;

      const [[data]] = await db.query(
        `SELECT
            COUNT(CASE WHEN p.status = 'hadir' THEN 1 END) AS hadir,
            COUNT(CASE WHEN p.status = 'telat' THEN 1 END) AS telat,
            COUNT(CASE WHEN p.status = 'izin' THEN 1 END) AS izin,
            COUNT(CASE WHEN p.status = 'alpha' THEN 1 END) AS alpha,
            COUNT(CASE WHEN p.status = 'belum hadir' THEN 1 END) AS belum_hadir
          FROM presensi p
          WHERE p.id_shift = ? AND p.id_praktikum = ? AND p.id_modul = ?`,
        [id_shift, id_praktikum, id_modul]
      );
      presensiData = data;

      const [[{ belum_hadir: belum }]] = await db.query(
        `SELECT COUNT(*) AS belum_hadir
           FROM kelompok_praktikum kp
           LEFT JOIN presensi p 
             ON p.id_user = kp.id_user 
             AND p.id_praktikum = kp.id_praktikum 
             AND p.id_shift = kp.id_shift 
             AND p.id_modul = ?
           WHERE kp.id_shift = ?
             AND kp.id_praktikum = ?
             AND kp.is_asisten != 1
             AND (
               p.id_user IS NULL OR p.status = 'Belum Hadir'
             )`,
        [id_modul, id_shift, id_praktikum]
      );

      belum_hadir = belum;
    }

    const [[{ total_pertemuan }]] = await db.query(
      `SELECT COUNT(*) AS total_pertemuan
         FROM modul_eldas
         WHERE id_praktikum = ?`,
      [id_praktikum]
    );

    res.status(200).json({
      message: "Berhasil mengambil summary presensi",
      data: {
        total_pertemuan,
        total_praktikan,
        belum_hadir,
        hadir: presensiData.hadir,
        telat: presensiData.telat,
        izin: presensiData.izin,
        alpha: presensiData.alpha,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil summary presensi",
      error,
    });
  }
};

// ✅ Ambil summary presensi berdasarkan ID Praktikum
export const getPresensiSummaryByPraktikum = async (req, res) => {
  try {
    const { id_praktikum } = req.params;
    console.log("ID Praktikum:", id_praktikum); // Debugging

    if (!id_praktikum) {
      return res.status(400).json({ message: "ID Praktikum tidak ditemukan" });
    }

    // Ambil total jumlah praktikan dalam praktikum tertentu
    const [totalPraktikan] = await db.execute(
      `SELECT COUNT(DISTINCT id_user) AS total 
            FROM users 
            WHERE role = 'praktikan' 
            AND id_user IN (SELECT DISTINCT id_user FROM presensi WHERE id_praktikum = ?)`,
      [id_praktikum]
    );

    // Ambil jumlah tiap status presensi dalam praktikum tertentu
    const [presensiData] = await db.execute(
      `SELECT 
                SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) AS hadir,
                SUM(CASE WHEN status = 'Belum Hadir' THEN 1 ELSE 0 END) AS belum_hadir,
                SUM(CASE WHEN status = 'Telat' THEN 1 ELSE 0 END) AS telat,
                SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) AS izin,
                SUM(CASE WHEN status = 'Alpha' THEN 1 ELSE 0 END) AS alpha
            FROM presensi
            WHERE id_praktikum = ?`,
      [id_praktikum]
    );

    // Kirim response JSON
    res.status(200).json({
      id_praktikum,
      totalPraktikan: totalPraktikan[0].total || 0,
      belumHadir: presensiData[0].belum_hadir || 0,
      hadir: presensiData[0].hadir || 0,
      telat: presensiData[0].telat || 0,
      alpha: presensiData[0].alpha || 0,
      izin: presensiData[0].izin || 0,
    });
  } catch (error) {
    console.error("Error mengambil data presensi:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data presensi", error: error.message });
  }
};
