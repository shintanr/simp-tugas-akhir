// controllers/penilaianController.mjs
import pool from "../config/database.js";

async function hitungTotalNilai(nilai) {
  const total =
    nilai.tugasPendahuluan * 0.1 +
    nilai.formData * 0.1 +
    nilai.praktikum * 0.2 +
    nilai.laporan * 0.3 +
    nilai.responsi * 0.3;

  return parseFloat(total.toFixed(2)); // membulatkan ke 2 angka di belakang koma
}

// Create Penilaian
export const createPenilaian = async (req, res) => {
  const {
    id_user,
    id_praktikum,
    id_modul,
    id_shift,
    nilai_tp,
    nilai_fd,
    nilai_praktikum,
    nilai_laporan_tugas,
    nilai_responsi,
  } = req.body; // Hanya menyimpan informasi dasar
  try {
    const nilai_total = await hitungTotalNilai({
      tugasPendahuluan: nilai_tp,
      formData: nilai_fd,
      praktikum: nilai_praktikum,
      laporan: nilai_laporan_tugas,
      responsi: nilai_responsi,
    })

    req.body.nilai_total = nilai_total

    // check apakah nilai sudah ada blum
    const [existingPenilaian] = await pool.query(
      "SELECT * FROM Penilaian WHERE id_user = ? AND id_praktikum = ? AND id_modul = ? AND id_shift = ?",
      [id_user, id_praktikum, id_modul, id_shift]
    );

    if (existingPenilaian.length > 0) {
      // jika ada update nilai
      const [result] = await pool.query(
        "UPDATE Penilaian SET ? WHERE id_user = ? AND id_praktikum = ? AND id_modul = ? AND id_shift = ?",
        [req.body, id_user, id_praktikum, id_modul, id_shift]
      );
      return res.status(200).json({
        message: "Penilaian updated successfully",
        data: req.body,
      });
    } else {
      // jika belum ada create baru
      const [result] = await pool.query(
        "INSERT INTO Penilaian (id_user, id_praktikum, id_modul, id_shift, nilai_tp, nilai_fd, nilai_praktikum, nilai_laporan_tugas, nilai_responsi, nilai_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id_user,
          id_praktikum,
          id_modul,
          id_shift,
          nilai_tp,
          nilai_fd,
          nilai_praktikum,
          nilai_laporan_tugas,
          nilai_responsi,
          nilai_total,
        ]
      );
      res.status(201).json({
        message: "Penilaian created successfully",
        data: req.body,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePenilaian = async (req, res) => {
  const { id } = req.params;
  if (!req.body) {
    return res.status(400).json({ message: "Penilaian data is required" });
  }
  try {
    const [result] = await pool.query("UPDATE Penilaian SET ? WHERE id = ?", [
      req.body,
      id,
    ]);
    res.status(200).json({
      message: "Penilaian updated successfully",
      data: req.body,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Nilai TP
export const updateNilaiTP = async (req, res) => {
  const { id } = req.params;
  const { nilai_tp } = req.body;

  // Validasi
  if (nilai_tp === undefined) {
    return res.status(400).json({ message: "Nilai TP is required" });
  }

  console.log("Updating Penilaian with ID:", id);
  console.log("New Nilai TP:", nilai_tp);

  try {
    const [result] = await pool.query(
      "UPDATE Penilaian SET nilai_tp = ? WHERE id = ?",
      [nilai_tp, id]
    );
    console.log("Affected Rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Penilaian not found" });
    }

    res.status(200).json({ message: "Nilai TP updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Nilai Laporan
export const updateNilaiLaporan = async (req, res) => {
  const { id } = req.params;
  const { nilai_laporan_tugas } = req.body;

  // Validasi
  if (nilai_laporan_tugas === undefined) {
    return res.status(400).json({ message: "Nilai Laporan Tugas is required" });
  }

  console.log("Updating Penilaian Laporan with ID:", id);
  console.log("New Nilai Laporan Tugas:", nilai_laporan_tugas);

  try {
    const [result] = await pool.query(
      "UPDATE Penilaian SET nilai_laporan_tugas = ? WHERE id = ?",
      [nilai_laporan_tugas, id]
    );
    console.log("Affected Rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Penilaian not found" });
    }

    res.status(200).json({ message: "Nilai Laporan updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Nilai Praktikum
export const updateNilaiPraktikum = async (req, res) => {
  const { id } = req.params;
  const { nilai_praktikum } = req.body;

  // Validasi
  if (nilai_praktikum === undefined) {
    return res.status(400).json({ message: "Nilai Praktikum is required" });
  }

  console.log("Updating Penilaian Praktikum with ID:", id);
  console.log("New Nilai Praktikum:", nilai_praktikum);

  try {
    const [result] = await pool.query(
      "UPDATE Penilaian SET nilai_praktikum = ? WHERE id = ?",
      [nilai_praktikum, id]
    );
    console.log("Affected Rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Penilaian not found" });
    }

    res.status(200).json({ message: "Nilai Praktikum updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Nilai FD
export const updateNilaiFD = async (req, res) => {
  const { id } = req.params;
  const { nilai_fd } = req.body;

  // Validasi
  if (nilai_fd === undefined) {
    return res.status(400).json({ message: "Nilai FD is required" });
  }

  console.log("Updating Penilaian FD with ID:", id);
  console.log("New Nilai FD:", nilai_fd);

  try {
    const [result] = await pool.query(
      "UPDATE Penilaian SET nilai_fd = ? WHERE id = ?",
      [nilai_fd, id]
    );
    console.log("Affected Rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Penilaian not found" });
    }

    res.status(200).json({ message: "Nilai FD updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Nilai Responsi
export const updateNilaiResponsi = async (req, res) => {
  const { id } = req.params;
  const { nilai_responsi } = req.body;

  // Validasi
  if (nilai_responsi === undefined) {
    return res.status(400).json({ message: "Nilai Responsi is required" });
  }

  console.log("Updating Penilaian Responsi with ID:", id);
  console.log("New Nilai Responsi:", nilai_responsi);

  try {
    const [result] = await pool.query(
      "UPDATE Penilaian SET nilai_responsi = ? WHERE id = ?",
      [nilai_responsi, id]
    );
    console.log("Affected Rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Penilaian not found" });
    }

    res.status(200).json({ message: "Nilai Responsi updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Read Penilaian
export const getPenilaian = async (req, res) => {
  try {
    const { id_user, id_praktikum, id_modul, id_shift } = req.query;

    // Buat array untuk kondisi WHERE dan parameter
    let whereClauses = [];
    let values = [];

    if (id_user) {
      whereClauses.push("kp.id_user = ?");
      values.push(id_user);
    }

    if (id_praktikum) {
      whereClauses.push("kp.id_praktikum = ?");
      values.push(id_praktikum);
    }

    if (id_modul) {
      whereClauses.push("( p.id_modul = ? OR p.id_modul IS NULL )");
      values.push(id_modul);
    }

    if (id_shift) {
      whereClauses.push("kp.id_shift = ?");
      values.push(id_shift);
    }

    const whereString = whereClauses.length
      ? `${whereClauses.join(" AND ")}`
      : "";
    console.log("🚀 ~ getPenilaian ~ whereString:", whereString);

    let filterIdModul = "";
    if (id_modul) {
      filterIdModul = `AND p.id_modul = ${id_modul}`;
    }

    let query = ''
    if(!id_user) {
      query = `SELECT 
          p.id,
          kp.id_user,
          kp.id_praktikum,
          kp.id_kelompok,
          kp.id_shift,
          kp.is_asisten,
          p.id_modul,
          p.nilai_tp,
          p.nilai_praktikum,
          p.nilai_fd,
          p.nilai_laporan_tugas,
          p.nilai_responsi,
          p.nilai_total,
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
        LEFT JOIN penilaian p ON kp.id_user = p.id_user AND kp.id_praktikum = p.id_praktikum ${filterIdModul}
        LEFT JOIN users u ON kp.id_user = u.id_user
        LEFT JOIN praktikum ON kp.id_praktikum = praktikum.id_praktikum
        LEFT JOIN modul_eldas ON p.id_modul = modul_eldas.id_modul
        LEFT JOIN shift ON kp.id_shift = shift.id_shift
        LEFT JOIN kelompok ON kp.id_kelompok = kelompok.id
        LEFT JOIN complaints c ON c.reference_type = 'penilaian' AND c.reference_id = p.id
        WHERE 1=1 AND kp.is_asisten != 1 ${
          whereString ? "AND " + whereString : ""
        } ORDER BY kelompok.id ASC`;
    } else {
      query = `
        SELECT 
          p.id,
          kp.id_user,
          kp.id_praktikum,
          kp.id_shift,
          kp.is_asisten,
          modul_eldas.id_modul,
          p.id_modul,
          p.nilai_tp,
          p.nilai_praktikum,
          p.nilai_fd,
          p.nilai_laporan_tugas,
          p.nilai_responsi,
          p.nilai_total,
          pr.status,
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
        LEFT JOIN penilaian p ON kp.id_user = p.id_user AND kp.id_praktikum = p.id_praktikum AND p.id_modul = modul_eldas.id_modul 
        LEFT JOIN presensi pr ON kp.id_user = pr.id_user AND kp.id_praktikum = pr.id_praktikum AND pr.id_modul = modul_eldas.id_modul
        LEFT JOIN users u ON kp.id_user = u.id_user
        LEFT JOIN shift ON kp.id_shift = shift.id_shift
        LEFT JOIN kelompok ON kp.id_kelompok = kelompok.id
        LEFT JOIN complaints c ON c.reference_type = 'penilaian' AND c.reference_id = p.id
        WHERE 1=1 AND kp.is_asisten != 1 ${
          whereString ? "AND " + whereString : ""
        } ORDER BY kelompok.id ASC
      `
    }

    const [rows] = await pool.query(
      query,
      values
    );

    res.json({
      message: "Berhasil mengambil data penilaian",
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPenilaianById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM Penilaian WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Penilaian not found" });
    }
    res.json({
      message: "Berhasil mengambil data penilaian",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete Penilaian
export const deletePenilaian = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Penilaian WHERE id = ?", [id]);
    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
