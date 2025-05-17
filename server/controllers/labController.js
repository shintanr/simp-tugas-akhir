import { getLabs, getPraktikumDataByLabId } from "../config/database.js";

export const getAllLabs = async (req, res) => {
  try {
    const labs = await getLabs();
    res.json({
      message: "List of Labs from Database",
      data: labs,
    });
  } catch (error) {
    console.error("Error fetching labs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPraktikumByLabId = async (req, res) => {
  try {
    const { labId } = req.params;
    const praktikum = await getPraktikumDataByLabId(labId);

    res.json({
      message: `List of Praktikum for Lab ID ${labId}`,
      data: praktikum,
    });
  } catch (error) {
    console.error("Error fetching praktikum:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};