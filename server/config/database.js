import mysql from 'mysql2/promise'
import dotenv from 'dotenv'


dotenv.config()

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: 3306,
})

// Fungsi untuk mengambil daftar lab

// Fungsi untuk mengambil data praktikum berdasarkan lab_id
export async function getPraktikumDataByLabId(labId) {
  const [rows] = await pool.query("SELECT * FROM praktikum WHERE lab_id = ?", [labId])
  return rows
}

// Fungsi untuk mengambil data modul berdasarkan praktikum_id
export async function getModulesEldasByPraktikumId(praktikumId, labId) {
  const [rows] = await pool.query("SELECT * FROM modul_eldas WHERE id_praktikum = ?", [praktikumId])
  return rows
}


export async function getLabs() {
  const [rows] = await pool.query("SELECT * FROM labs")
  return rows
}

export async function getPraktikumByLabId(labId) {
  const [rows] = await pool.query("SELECT * FROM praktikum WHERE lab_id = ?", [labId]);
  return rows;
}

export async function getModulesAllByPraktikumId(praktikumId) {
  const [rows] = await pool.query('SELECT * FROM modul_eldas WHERE id_praktikum = ?', [praktikumId]);
  return rows;
}

export async function getSubModulesEldasByModulId(modulId) {
  const [rows] = await pool.query('SELECT * FROM submodul_eldas WHERE id_modul = ?', [modulId]);
  return rows;
}

export async function getSubModulesSDLByModulId(modulId) {
  const [rows] = await pool.query('SELECT * FROM submodul_sdl WHERE id_modul = ?', [modulId]);
  return rows;
}

export async function getVideosSubModulesEldasBySubModulId(submodulId) {
  const [rows] = await pool.query('SELECT video_url FROM submodul_eldas WHERE id_submodul = ?', [submodulId]);
  return rows;
}

export async function getVideosSubModulesSDLBySubModulId(submodulId) {
  const [rows] = await pool.query('SELECT video_url FROM submodul_sdl WHERE id_submodul = ?', [submodulId]);
  return rows;
}

export async function getQuizEldasBySubModulId(submodulId) {
  const [rows] = await pool.query(`
   SELECT id_quiz, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar
   FROM quiz_eldas
   WHERE id_submodul IN (?)`, [submodulId]);
  return rows;
}

export async function getQuizSDLBySubModulId(submodulId) {
  const [rows] = await pool.query(`
   SELECT id_quiz, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar
   FROM quiz_sdl
   WHERE id_submodul IN (?)`, [submodulId]);
  return rows;
}

export async function checkAnswer(quizId, userAnswer) {
  const [rows] = await pool.query(
    `SELECT jawaban_benar FROM quiz_eldas WHERE id_quiz = ?`,
    [quizId]
  );
  if (rows.length === 0) return { success: false, message: "Quiz tidak ditemukan" };
  const isCorrect = rows[0].jawaban_benar === userAnswer;
  return { success: true, correct: isCorrect };
}

export async function saveUserAnswer(userId, quizId, userAnswer) {
  const [result] = await pool.query(
    `INSERT INTO user_answers (user_id, id_quiz, user_answer) VALUES (?, ?, ?)`,
    [userId, quizId, userAnswer]
  );
  return result;
}

// ===========================================
// New Admin Dashboard Functions
// ===========================================

// Module Admin Functions
export async function createModule(moduleData) {
  const { judul_modul, id_praktikum } = moduleData;
  const [result] = await pool.query(
    'INSERT INTO modul (judul_modul, id_praktikum) VALUES (?, ?)',
    [judul_modul, id_praktikum]
  );
  return { id_modul: result.insertId, ...moduleData };
}

export async function updateModule(moduleId, moduleData) {
  const { judul_modul } = moduleData;
  const [result] = await pool.query(
    'UPDATE modul SET judul_modul = ? WHERE id_modul = ?',
    [judul_modul, moduleId]
  );
  return { id_modul: moduleId, ...moduleData, affectedRows: result.affectedRows };
}

export async function deleteModule(moduleId) {
  // First delete associated submodules for SDL and Eldas
  await pool.query('DELETE FROM submodul_sdl WHERE id_modul = ?', [moduleId]);
  await pool.query('DELETE FROM submodul_eldas WHERE id_modul = ?', [moduleId]);
  
  // Then delete the module
  const [result] = await pool.query('DELETE FROM modul_eldas WHERE id_modul = ?', [moduleId]);
  return { affectedRows: result.affectedRows };
}

// Submodule Admin Functions for SDL
export async function createSubmoduleSDL(submoduleData) {
  const { judul_submodul, video_url, pdf_url, id_modul } = submoduleData;
  const [result] = await pool.query(
    'INSERT INTO submodul_sdl (judul_submodul, video_url, pdf_url, id_modul) VALUES (?, ?, ?, ?)',
    [judul_submodul, video_url, pdf_url, id_modul]
  );
  return { id_submodul: result.insertId, ...submoduleData };
}

export async function updateSubmoduleSDL(submoduleId, submoduleData) {
  try {
    const { judul_submodul, video_url, pdf_url } = submoduleData;
    console.log('Updating Submodule:', { submoduleId, judul_submodul, video_url, pdf_url });

    const [result] = await pool.query(
      'UPDATE submodul_sdl SET judul_submodul = ?, video_url = ?, pdf_url = ? WHERE id_submodul = ?',
      [judul_submodul, video_url, pdf_url, submoduleId]
    );

    console.log('Update Result:', result);

    if (result.affectedRows === 0) {
      throw new Error('No submodule found with this ID');
    }

    return { id_submodul: submoduleId, ...submoduleData, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Detailed Update Error:', error);
    throw error;
  }
}

export async function deleteSubmoduleSDL(submoduleId) {
  // First delete associated quizzes
  await pool.query('DELETE FROM quiz_sdl WHERE id_submodul = ?', [submoduleId]);
  
  // Then delete the submodule
  const [result] = await pool.query('DELETE FROM submodul_sdl WHERE id_submodul = ?', [submoduleId]);
  return { affectedRows: result.affectedRows };
}

// Submodule Admin Functions for ELDAS
export async function createSubmoduleEldas(submoduleData) {
  const { judul_submodul, video_url, pdf_url, id_modul } = submoduleData;
  const [result] = await pool.query(
    'INSERT INTO submodul_eldas (judul_submodul, video_url, pdf_url, id_modul) VALUES (?, ?, ?, ?)',
    [judul_submodul, video_url, pdf_url, id_modul]
  );
  return { id_submodul: result.insertId, ...submoduleData };
}

export async function updateSubmoduleEldas(submoduleId, submoduleData) {
  try {
    const { judul_submodul, video_url, pdf_url } = submoduleData;
    console.log('Updating ELDAS Submodule:', { submoduleId, judul_submodul, video_url, pdf_url });

    const [result] = await pool.query(
      'UPDATE submodul_eldas SET judul_submodul = ?, video_url = ?, pdf_url = ? WHERE id_submodul = ?',
      [judul_submodul, video_url, pdf_url, submoduleId]
    );

    console.log('Update Result:', result);

    if (result.affectedRows === 0) {
      throw new Error('No submodule found with this ID');
    }

    return { id_submodul: submoduleId, ...submoduleData, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Detailed Update Error:', error);
    throw error;
  }
}

export async function deleteSubmoduleEldas(submoduleId) {
  // First delete associated quizzes
  await pool.query('DELETE FROM quiz_eldas WHERE id_submodul = ?', [submoduleId]);

  // Then delete the submodule
  const [result] = await pool.query('DELETE FROM submodul_eldas WHERE id_submodul = ?', [submoduleId]);
  return { affectedRows: result.affectedRows };
}


// Quiz Admin Functions for SDL
export async function createQuizSDL(quizData) {
  const { 
    id_submodul, 
    pertanyaan, 
    pilihan_a, 
    pilihan_b, 
    pilihan_c, 
    pilihan_d, 
    jawaban_benar 
  } = quizData;
  
  const [result] = await pool.query(
    `INSERT INTO quiz_sdl 
     (id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar]
  );
  
  return { id_quiz: result.insertId, ...quizData };
}

export async function updateQuizSDL(quizId, quizData) {
  console.log("Received update request for Quiz ID (RAW):", quizId);

  try {
    // Log the type and value of quizId to debug
    console.log("QuizID Type:", typeof quizId);
    console.log("QuizID Value:", quizId);

    // Attempt to convert quizId into a valid number
    const parsedQuizId = quizId === null || quizId === undefined 
      ? null 
      : Number(String(quizId).trim());

    // Validate that the parsed quizId is a number
    if (parsedQuizId === null || isNaN(parsedQuizId)) {
      throw new Error(`Invalid Quiz ID: ${quizId}. Must be a valid number.`);
    }

    const { pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar } = quizData;

    // Validate that all necessary fields are present
    if (!pertanyaan || !pilihan_a || !pilihan_b || !pilihan_c || !pilihan_d || !jawaban_benar) {
      throw new Error('All fields are required');
    }

    const query = `
      UPDATE quiz_sdl 
      SET 
        pertanyaan = ?, 
        pilihan_a = ?, 
        pilihan_b = ?, 
        pilihan_c = ?, 
        pilihan_d = ?, 
        jawaban_benar = ?
      WHERE id_quiz = ?
    `;

    const [result] = await pool.query(query, [
      pertanyaan,
      pilihan_a,
      pilihan_b,
      pilihan_c,
      pilihan_d,
      jawaban_benar,
      parsedQuizId
    ]);

    console.log("Update Result:", result);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      throw new Error(`No quiz found with ID ${parsedQuizId}`);
    }

    return { 
      id_quiz: parsedQuizId, 
      ...quizData, 
      affectedRows: result.affectedRows 
    };

  } catch (error) {
    console.error("Detailed Update Error:", error);
    throw error;
  }
}

export async function deleteQuizSDL(quizId) {
  // Delete user answers related to this quiz if needed
  // await pool.query('DELETE FROM user_answers WHERE id_quiz = ?', [quizId]);
  
  // Delete the quiz
  const [result] = await pool.query('DELETE FROM quiz_sdl WHERE id_quiz = ?', [quizId]);
  return { affectedRows: result.affectedRows };
}

// Quiz Admin Functions for Eldas
export async function createQuizEldas(quizData) {
  const { 
    id_submodul, 
    pertanyaan, 
    pilihan_a, 
    pilihan_b, 
    pilihan_c, 
    pilihan_d, 
    jawaban_benar 
  } = quizData;
  
  const [result] = await pool.query(
    `INSERT INTO quiz_eldas 
     (id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar]
  );
  
  return { id_quiz: result.insertId, ...quizData };
}

export async function updateQuizEldas(quizId, quizData) {
  const { 
    pertanyaan, 
    pilihan_a, 
    pilihan_b, 
    pilihan_c, 
    pilihan_d, 
    jawaban_benar 
  } = quizData;
  
  const [result] = await pool.query(
    `UPDATE quiz_eldas 
     SET pertanyaan = ?, pilihan_a = ?, pilihan_b = ?, pilihan_c = ?, pilihan_d = ?, jawaban_benar = ? 
     WHERE id_quiz = ?`,
    [pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, quizId]
  );
  
  return { id_quiz: quizId, ...quizData, affectedRows: result.affectedRows };
}

export async function deleteQuizEldas(quizId) {
  // Delete user answers related to this quiz if needed
  // await pool.query('DELETE FROM user_answers WHERE id_quiz = ?', [quizId]);
  
  // Delete the quiz
  const [result] = await pool.query('DELETE FROM quiz_eldas WHERE id_quiz = ?', [quizId]);
  return { affectedRows: result.affectedRows };
}

// User Authentication Functions (for Admin)
export async function checkAdminAuth(username, password) {
  const [rows] = await pool.query(
    'SELECT * FROM admin WHERE username = ? AND password = ?',
    [username, password]
  );
  
  if (rows.length === 0) {
    return { authenticated: false };
  }
  
  return { authenticated: true, adminData: rows[0] };
}


// kode airin
export async function getPraktikum() {
  try {
    console.log("Fetching praktikum from database...");
    const [rows] = await pool.query(`SELECT id_praktikum, name FROM praktikum`);
    console.log("Query result:", rows);

    if (rows.length === 0) return { success: false, message: "Tidak ada praktikum ditemukan" };

    return { success: true, data: rows };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, message: "Database error" };
  }
}

export async function getPraktikumById(praktikumId) {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM praktikum 
      WHERE id_praktikum = ?
    `, [praktikumId]);
    
    console.log('Rows found:', rows); // Tambahkan logging

    if (rows.length === 0) {
      return { 
        success: false, 
        message: 'Praktikum tidak ditemukan' 
      };
    }

    return { 
      success: true, 
      data: rows[0] 
    };
  } catch (error) {
    console.error('Detailed Error getting praktikum by ID:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

export async function getPertemuan(praktikumId) {
  const [rows] = await pool.query(
    `SELECT id_pertemuan, pertemuan_ke FROM pertemuan WHERE id_praktikum = ?`,
    [praktikumId]
  );

  if (rows.length === 0) return { success: false, message: "Tidak ada pertemuan untuk praktikum ini" };

  return { success: true, data: rows };
}

// Mendapatkan semua submission berdasarkan ID Praktikum

export async function getSubmissionsByPraktikumId(praktikumId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sp.id_submission_praktikan, 
        sp.id_pertemuan, 
        sp.jenis, 
        sp.file_path, 
        sp.status, 
        p.pertemuan_ke
      FROM submission_praktikan sp
      LEFT JOIN pertemuan p ON sp.id_pertemuan = p.id_pertemuan
      WHERE sp.id_praktikum = ?
    `, [praktikumId]);
    
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error saat mengambil data submission:', error);
    return { success: false, message: 'Database error' };
  }
}

// Upload submission baru
export async function uploadSubmission(idPraktikum, idPertemuan, idPraktikan, jenis, filePath) {
  try {
    const [result] = await pool.query(`
      INSERT INTO submission_praktikan (id_praktikum, id_pertemuan, id_praktikan, jenis, file_path, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'Submitted', NOW())
    `, [idPraktikum, idPertemuan, idPraktikan, jenis, filePath]);
    
    return { 
      success: true, 
      data: { 
        id: result.insertId,
        file_path: filePath
      }
    };
  } catch (error) {
    console.error('Error saat upload submission:', error);
    return { success: false, message: 'Database error' };
  }
}

// Mendapatkan path file dari submission berdasarkan ID
export async function getSubmissionFilePath(submissionId) {
  try {
    const [rows] = await pool.query(`
      SELECT file_path FROM submission_praktikan WHERE id_submission_praktikan = ?
    `, [submissionId]);
    
    if (rows.length === 0) {
      return { success: false, message: 'Submission tidak ditemukan' };
    }
    
    return { success: true, data: rows[0].file_path };
  } catch (error) {
    console.error('Error saat mengambil file path submission:', error);
    return { success: false, message: 'Database error' };
  }
}

// Menghapus submission berdasarkan ID
export async function deleteSubmission(submissionId) {
  try {
    const [result] = await pool.query(`
      DELETE FROM submission_praktikan WHERE id_submission_praktikan = ?
    `, [submissionId]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Submission tidak ditemukan' };
    }
    
    return { success: true, message: 'Submission berhasil dihapus' };
  } catch (error) {
    console.error('Error saat menghapus submission:', error);
    return { success: false, message: 'Database error' };
  }
}

//Query Database untuk Tugas Pendahuluan

// Query untuk get all list TP by jenis pertemuan
export async function getAllTpByPraktikum(praktikumId) {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        p.pertemuan_ke,
        p.id_pertemuan,
        pr.name as nama_praktikum,
        pr.id_praktikum,
        (SELECT COUNT(*) FROM tp_soal WHERE id_praktikum = ? AND id_pertemuan = p.id_pertemuan) AS jumlah_soal
      FROM pertemuan p
      JOIN tp_soal ts ON p.id_pertemuan = ts.id_pertemuan
      JOIN praktikum pr ON pr.id_praktikum = ts.id_praktikum
      WHERE ts.id_praktikum = ?
      ORDER BY p.pertemuan_ke ASC
    `, [praktikumId, praktikumId]);
    
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error saat mengambil daftar TP:', error);
    return { success: false, message: 'Database error' };
  }
}

// Query untuk get soal TP by ID PRAK dan ID Pertemuan (ex Eldas, Per 1)
export async function getTpSoalByPraktikumAndPertemuan(praktikumId, pertemuanId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ts.id_soal, 
        ts.pertanyaan,
        p.pertemuan_ke
      FROM tp_soal ts
      LEFT JOIN pertemuan p ON ts.id_pertemuan = p.id_pertemuan
      WHERE ts.id_praktikum = ? AND ts.id_pertemuan = ?
    `, [praktikumId, pertemuanId]);
    
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error saat mengambil soal TP:', error);
    return { success: false, message: 'Database error' };
  }
}


// === Query Database tp_attempts dan tp_attempts_detail ===

// Fungsi untuk membuat TP Attempt baru
export async function createTpAttempt(data) {
  try {
    // Menggunakan tanggal sekarang untuk completed_at
    const completedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.query(`
      INSERT INTO tp_attempts (
        id_praktikum, 
        id_pertemuan, 
        id_user, 
        total_score, 
        completed_at
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      data.id_praktikum,
      data.id_pertemuan,
      data.id_user,
      data.total_score || null, // Total score mungkin belum ada saat pertama kali dibuat
      completedAt
    ]);
    
    return { 
      success: true, 
      data: { 
        id_attempts: result.insertId,
        ...data,
        completed_at: completedAt
      } 
    };
  } catch (error) {
    console.error('Error saat membuat TP attempt:', error);
    return { success: false, message: 'Database error' };
  }
}

// Fungsi untuk menyimpan detail jawaban TP
export async function createTpAttemptsDetails(detailsArray) {
  try {
    // Siapkan query untuk insert multiple rows
    const values = detailsArray.map(detail => 
      [detail.id_attempts, detail.id_soal, detail.tp_answer, detail.score_awarded || null]
    );
    
    // Menggunakan batch insert untuk efisiensi
    const placeholders = detailsArray.map(() => '(?, ?, ?, ?)').join(', ');
    
    const [result] = await pool.query(`
      INSERT INTO tp_attempt_details (
        id_attempts, 
        id_soal, 
        tp_answer, 
        score_awarded
      ) VALUES ${placeholders}
    `, values.flat());
    
    return { 
      success: true, 
      message: `Berhasil menyimpan ${detailsArray.length} jawaban`,
      data: { 
        affectedRows: result.affectedRows,
      } 
    };
  } catch (error) {
    console.error('Error saat menyimpan detail jawaban TP:', error);
    return { success: false, message: 'Database error' };
  }
}

// Contoh cara penggunaan kedua fungsi
export async function submitTugasPendahuluan(praktikumData, detailsData) {
  try {
    // Buat attempt utama
    const attemptResult = await createTpAttempt({
      id_praktikum: praktikumData.praktikumId,
      id_pertemuan: praktikumData.pertemuanId,
      id_user: praktikumData.userId,
      total_score: praktikumData.totalScore
    });

    if (!attemptResult.success) {
      throw new Error(attemptResult.message);
    }

    // Siapkan details dengan id_attempts yang baru dibuat
    const detailsWithAttemptId = detailsData.map(detail => ({
      ...detail,
      id_attempts: attemptResult.data.id_attempts
    }));

    // Simpan detail jawaban
    const detailsResult = await createTpAttemptsDetails(detailsWithAttemptId);

    if (!detailsResult.success) {
      throw new Error(detailsResult.message);
    }

    return {
      success: true,
      attempts: attemptResult.data,
      details: detailsResult.data
    };
  } catch (error) {
    console.error('Error saat submit tugas pendahuluan:', error);
    return { success: false, message: error.message };
  }
}

// Function untuk mendapatkan semua submission praktikan untuk asprak
export async function getSubmissionsPraktikanForAsprak() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sp.id_submission_praktikan, 
        sp.id_pertemuan, 
        sp.jenis,
        sp.file_path,
        sp.status,
        sp.catatan_asistensi,
        sp.file_revisi_asprak,
        sp.created_at,
        sp.updated_at,
        u.id_user,
        u.full_name AS nama_praktikan, 
        u.nim,
        p.pertemuan_ke
      FROM 
        submission_praktikan sp
      LEFT JOIN 
        users u ON sp.id_user = u.id_user
      LEFT JOIN 
        pertemuan p ON sp.id_pertemuan = p.id_pertemuan
      ORDER BY 
        sp.created_at DESC
    `);
    
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error saat mengambil data submission untuk asprak:', error);
    return { success: false, message: 'Database error' };
  }
}

// Function untuk mendapatkan detail submission praktikan by ID
export async function getSubmissionPraktikanDetailById(submissionId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sp.id_submission_praktikan, 
        sp.id_pertemuan, 
        sp.jenis,
        sp.file_path,
        sp.status,
        sp.catatan_asistensi,
        sp.file_revisi_asprak,
        sp.created_at,
        sp.updated_at,
        u.id_user,
        u.full_name AS nama_praktikan, 
        u.nim,
        p.pertemuan_ke
      FROM 
        submission_praktikan sp
      LEFT JOIN 
        users u ON sp.id_user = u.id_user
      LEFT JOIN 
        pertemuan p ON sp.id_pertemuan = p.id_pertemuan
      WHERE 
        sp.id_submission_praktikan = ?
    `, [submissionId]);
    
    if (rows.length === 0) {
      return { success: false, message: 'Submission tidak ditemukan' };
    }
    
    return { success: true, data: rows[0] };
  } catch (error) {
    console.error('Error saat mengambil detail submission:', error);
    return { success: false, message: 'Database error' };
  }
}

// Function untuk menyimpan asistensi dan update status submission praktikan
export async function saveAsistensi(submissionData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Update submission_praktikan dengan catatan dan file revisi
    const [updateResult] = await connection.query(`
      UPDATE submission_praktikan 
      SET 
        status = ?, 
        catatan_asistensi = ?, 
        file_revisi_asprak = ?,
        updated_at = NOW()
      WHERE 
        id_submission_praktikan = ?
    `, [
      submissionData.status,
      submissionData.catatan_asistensi,
      submissionData.file_revisi_asprak,
      submissionData.id_submission_praktikan
    ]);
    
    // 2. Insert ke submission_asprak hanya sebagai catatan histori/log
    // Versi yang sangat disederhanakan, hanya mencatat ID referensi dan user
    const [insertResult] = await connection.query(`
      INSERT INTO submission_asprak 
        (id_submission_praktikan, id_user, created_at)
      VALUES 
        (?, ?, NOW())
    `, [
      submissionData.id_submission_praktikan,
      submissionData.id_user
    ]);
    
    await connection.commit();
    
    return { 
      success: true, 
      message: 'Asistensi berhasil disimpan',
      data: {
        updateId: submissionData.id_submission_praktikan,
        insertId: insertResult.insertId
      }
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error saat menyimpan asistensi:', error);
    return { success: false, message: 'Database error' };
  } finally {
    connection.release();
  }
}

export async function getFilteredSubmissionsPraktikanForAsprak(idPraktikum, idPertemuan) {
  try {
    let query = `
      SELECT 
        sp.id_submission_praktikan, 
        sp.id_praktikum,
        sp.id_pertemuan, 
        sp.jenis,
        sp.file_path,
        sp.status,
        sp.catatan_asistensi,
        sp.file_revisi_asprak,
        sp.created_at,
        sp.updated_at,
        u.id_user,
        u.full_name AS nama_praktikan, 
        u.nim,
        p.pertemuan_ke
      FROM 
        submission_praktikan sp
      LEFT JOIN 
        users u ON sp.id_user = u.id_user
      LEFT JOIN 
        pertemuan p ON sp.id_pertemuan = p.id_pertemuan
      WHERE 1=1
    `;

    const params = [];
    
    // Tambahkan filter praktikum jika ada
    if (idPraktikum) {
      query += " AND sp.id_praktikum = ?";
      params.push(idPraktikum);
    }
    
    // Tambahkan filter pertemuan jika ada dan bukan "all"
    if (idPertemuan && idPertemuan !== "all") {
      query += " AND sp.id_pertemuan = ?";
      params.push(idPertemuan);
    }
    
    // Tambahkan order by
    query += " ORDER BY sp.created_at DESC";
    
    const [rows] = await pool.query(query, params);
    
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error saat mengambil data submission untuk asprak:', error);
    return { success: false, message: 'Database error' };
  }
}

// Panggil testDatabaseQueries hanya jika file ini dijalankan langsung, bukan diimpor
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseQueries()
}

export default pool