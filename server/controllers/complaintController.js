import db from "../config/database.js"; // Pastikan path ini sesuai dengan lokasi config database

export const createComplaint = async (req, res) => {
  const { reference_type, reference_id, description, status } = req.body;

  if (!reference_type || !reference_id || !description || !status) {
    return res
      .status(400)
      .json({
        message: "reference_type, reference_id, description is required",
      });
  }

  // check apakah reference_id ada
  const [reference] = await db.query(
    `SELECT * FROM ${reference_type} WHERE id = ?`,
    [reference_id]
  );

  if (reference.length === 0) {
    return res.status(404).json({ message: "Reference not found" });
  }

  // check apakah data udah ada
  const [existingComplaint] = await db.query(
    "SELECT * FROM complaints WHERE reference_type = ? AND reference_id = ?",
    [reference_type, reference_id, description]
  );

  try {
    if (existingComplaint.length > 0) {
      // update deksripsi dan statusnya
      const [rows] = await db.query(
        "UPDATE complaints SET description = ?, status = ? WHERE reference_type = ? AND reference_id = ?",
        [description, status, reference_type, reference_id]
      );
      return res
        .status(200)
        .json({ message: "Complaint updated successfully", data: rows });
    } else {
      const [rows] = await db.query(
        "INSERT INTO complaints (reference_type, reference_id, description, status) VALUES (?, ?, ?, ?)",
        [reference_type, reference_id, description, status]
      );
      res
        .status(201)
        .json({ message: "Complaint created successfully", data: rows });
    }
  } catch (error) {
    console.log("🚀 ~ createComplaint ~ error:", error);
    res.status(500).json({ message: "Failed to create complaint", error });
  }
};

export const updateStatusComplaint = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  const statuses = ["open", "closed"];
  if (!statuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // check apakah ada id complaint
  const [complaint] = await db.query("SELECT * FROM complaints WHERE id = ?", [
    id,
  ]);

  if (complaint.length === 0) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  try {
    const [rows] = await db.query(
      "UPDATE complaints SET status = ? WHERE id = ?",
      [status, id]
    );
    res
      .status(200)
      .json({ message: "Complaint updated successfully", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint", error });
  }
};
