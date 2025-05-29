import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "lab_management_final",
  port: 8889,
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
