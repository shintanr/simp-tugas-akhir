import pool, { getModulesEldasByPraktikumId } from "../config/database.js";

export const getModulesByPraktikumId = async (req, res) => {
  try {
    const { prakId } = req.params;
    const module = await getModulesEldasByPraktikumId(prakId);

    res.json({
      message: `List of Module Praktikum Elektronika Dasar ${prakId}`,
      data: module,
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllPraktikumWithModules = async (req, res) => {
  try {
    const { lab_id, limit = 10, page = 1, search = '', orderBy = 'id_praktikum', sortDirection = 'ASC' } = req.query;

    // Menghitung offset untuk pagination
    const offset = (page - 1) * limit;

    // Membangun query dasar
    let query = "SELECT l.name as lab_name, p.* FROM praktikum p JOIN labs l ON p.lab_id = l.id";
    let params = [];

    // Menambahkan filter lab_id jika ada
    if (lab_id) {
      query += " WHERE lab_id = ?";
      params.push(lab_id);
    }

    // Menambahkan filter pencarian jika ada
    if (search) {
      query += params.length ? " AND" : " WHERE";
      query += " (name LIKE ? OR code LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Menambahkan pengurutan
    query += ` ORDER BY ${orderBy === "" ? "id_praktikum" : orderBy} ${sortDirection}`;

    // Menambahkan limit dan offset untuk pagination
    query += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    // Menjalankan query untuk mendapatkan data praktikum
    const [rows] = await pool.query(query, params);

    // Membangun query untuk menghitung total jumlah praktikum yang sesuai dengan filter
    let countQuery = "SELECT COUNT(*) as total FROM praktikum";
    let countParams = [];

    // Menambahkan filter lab_id jika ada
    if (lab_id) {
      countQuery += " WHERE lab_id = ?";
      countParams.push(lab_id);
    }

    // Menambahkan filter pencarian jika ada
    if (search) {
      countQuery += countParams.length ? " AND" : " WHERE";
      countQuery += " (name LIKE ? OR code LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Menjalankan query untuk menghitung total
    const [[{ total }]] = await pool.query(countQuery, countParams);

    // Mengambil modules untuk setiap praktikum
    const praktikumWithModules = await Promise.all(
      rows.map(async (praktikum) => {
        const modules = await getModulesEldasByPraktikumId(praktikum.id_praktikum);
        return {
          ...praktikum,
          modules,
        };
      })
    );

    const praktikumWithLabs = await Promise.all(
      praktikumWithModules.map(async (praktikum) => {
        const lab = await pool.query("SELECT * FROM labs WHERE id = ?", [
          praktikum.lab_id,
        ]);
        return {
          ...praktikum,
          lab: lab[0][0],
        };
      })
    );

    // Mengirim response
    res.json({
      message: "List of Praktikum with Modules",
      data: praktikumWithLabs,
      count: total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPraktikum = async (req, res) => {
  const { lab_id, name, modul, code, modules } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO praktikum (lab_id, name, modul, code) VALUES (?, ?, ?, ?)`,
      [lab_id, name, modul, code]
    );

    const praktikumId = result.insertId;

    if (Array.isArray(modules) && modules.length > 0) {
      const moduleInsertData = modules.map((m) => [
        praktikumId,
        m.judul_modul,
        m.deskripsi,
        m.file_modul,
      ]);

      await conn.query(
        `INSERT INTO modul_eldas (id_praktikum, judul_modul, deskripsi, file_modul) VALUES ?`,
        [moduleInsertData]
      );
    }

    await conn.commit();
    res
      .status(201)
      .json({ message: "Praktikum created successfully", praktikumId });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to create praktikum" });
  } finally {
    conn.release();
  }
};

export const getPraktikumById = async (req, res) => {
  const { id } = req.params;
  try {
    const [praktikumRows] = await pool.query(
      `SELECT * FROM praktikum WHERE id_praktikum = ?`,
      [id]
    );

    if (praktikumRows.length === 0) {
      return res.status(404).json({ message: "Praktikum not found" });
    }

    const [moduleRows] = await pool.query(
      `SELECT * FROM modul_eldas WHERE id_praktikum = ?`,
      [id]
    );

    res.json({
      ...praktikumRows[0],
      modules: moduleRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve praktikum" });
  }
};

export const updatePraktikum = async (req, res) => {
  const { id } = req.params;
  const { lab_id, name, modul, code, modules } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE praktikum SET lab_id = ?, name = ?, modul = ?, code = ? WHERE id_praktikum = ?`,
      [lab_id, name, modul, code, id]
    );

    // Hapus modul sebelumnya
    await conn.query(`DELETE FROM modul_eldas WHERE id_praktikum = ?`, [id]);

    // Tambahkan modul baru
    if (Array.isArray(modules) && modules.length > 0) {
      const moduleInsertData = modules.map((m) => [
        id,
        m.judul_modul,
        m.deskripsi,
        m.file_modul,
      ]);

      await conn.query(
        `INSERT INTO modul_eldas (id_praktikum, judul_modul, deskripsi, file_modul) VALUES ?`,
        [moduleInsertData]
      );
    }

    await conn.commit();
    res.json({ message: "Praktikum updated successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to update praktikum" });
  } finally {
    conn.release();
  }
};

export const deletePraktikum = async (req, res) => {
  const { id } = req.params;
  try {
    // Hapus modul terlebih dahulu
    await pool.query(`DELETE FROM modul WHERE id_praktikum = ?`, [id]);

    // Baru hapus praktikum
    await pool.query(`DELETE FROM praktikum WHERE id_praktikum = ?`, [id]);

    res.json({ message: "Praktikum deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete praktikum" });
  }
};
