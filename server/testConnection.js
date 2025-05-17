import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "lab_management",
  port: 3306,
});

async function test() {
  try {
    const [rows] = await pool.query("SELECT * FROM labs");
    console.log("✅ Connected! Data:", rows);
  } catch (err) {
    console.error("❌ Error connecting:", err);
  }
}

test();
