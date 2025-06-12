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

export async function getSubModulesPJKByModulId(modulId) {
  const [rows] = await pool.query('SELECT * FROM submodul_pjk WHERE id_modul = ?', [modulId]);
  return rows;
}

export async function getSubModulesSBDByModulId(modulId) {
  const [rows] = await pool.query('SELECT * FROM submodul_sbd WHERE id_modul = ?', [modulId]);
  return rows;
}

export async function getSubModulesMulmedByModulId(modulId) {
  const [rows] = await pool.query('SELECT * FROM submodul_mulmed WHERE id_modul = ?', [modulId]);
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

export async function getVideosSubModulesPJKBySubModulId(submodulId) {
  const [rows] = await pool.query('SELECT video_url FROM submodul_pjk WHERE id_submodul = ?', [submodulId]);
  return rows;
}

export async function getVideosSubModulesSBDBySubModulId(submodulId) {
  const [rows] = await pool.query('SELECT video_url FROM submodul_sbd WHERE id_submodul = ?', [submodulId]);
  return rows;
}

export async function getVideosSubModulesMulmedBySubModulId(submodulId) {
  const [rows] = await pool.query('SELECT video_url FROM submodul_mulmed WHERE id_submodul = ?', [submodulId]);
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

export async function getQuizPJKBySubModulId(submodulId) {
  const [rows] = await pool.query(`
   SELECT id_quiz, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar
   FROM quiz_pjk
   WHERE id_submodul IN (?)`, [submodulId]);
  return rows;
}

export async function getQuizSBDBySubModulId(submodulId) {
  const [rows] = await pool.query(`
   SELECT id_quiz, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar
   FROM quiz_sbd
   WHERE id_submodul IN (?)`, [submodulId]);
  return rows;
}

export async function getQuizMulmedBySubModulId(submodulId) {
  const [rows] = await pool.query(`
   SELECT id_quiz, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar
   FROM quiz_mulmed
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
    'INSERT INTO modul_eldas (judul_modul, id_praktikum) VALUES (?, ?)',
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
  await pool.query('DELETE FROM submodul_pjk WHERE id_modul = ?', [moduleId]);
  
  // Then delete the module
  const [result] = await pool.query('DELETE FROM modul_eldas WHERE id_modul = ?', [moduleId]);
  return { affectedRows: result.affectedRows };
}

// ===========================================
// SDL Admin Dashboard Functions
// ===========================================
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



// ===========================================
// Eldas Admin Dashboard Functions
// ===========================================
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


// ===========================================
// PJK Admin Dashboard Functions
// ===========================================
export async function createSubmodulePJK(submoduleData) {
  const { judul_submodul, video_url, pdf_url, id_modul } = submoduleData;
  const [result] = await pool.query(
    'INSERT INTO submodul_pjk (judul_submodul, video_url, pdf_url, id_modul) VALUES (?, ?, ?, ?)',
    [judul_submodul, video_url, pdf_url, id_modul]
  );
  return { id_submodul: result.insertId, ...submoduleData };
}

export async function updateSubmodulePJK(submoduleId, submoduleData) {
  try {
    const { judul_submodul, video_url, pdf_url } = submoduleData;
    console.log('Updating Submodule:', { submoduleId, judul_submodul, video_url, pdf_url });

    const [result] = await pool.query(
      'UPDATE submodul_pjk SET judul_submodul = ?, video_url = ?, pdf_url = ? WHERE id_submodul = ?',
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

export async function deleteSubmodulePJK(submoduleId) {
  // First delete associated quizzes
  await pool.query('DELETE FROM quiz_pjk WHERE id_submodul = ?', [submoduleId]);
  
  // Then delete the submodule
  const [result] = await pool.query('DELETE FROM submodul_pjk WHERE id_submodul = ?', [submoduleId]);
  return { affectedRows: result.affectedRows };
}

// Quiz Admin Functions for PJK
export async function createQuizPJK(quizData) {
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
    `INSERT INTO quiz_pjk 
     (id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar]
  );
  
  return { id_quiz: result.insertId, ...quizData };
}

export async function updateQuizPJK(quizId, quizData) {
  const { 
    pertanyaan, 
    pilihan_a, 
    pilihan_b, 
    pilihan_c, 
    pilihan_d, 
    jawaban_benar 
  } = quizData;
  
  const [result] = await pool.query(
    `UPDATE quiz_pjk 
     SET pertanyaan = ?, pilihan_a = ?, pilihan_b = ?, pilihan_c = ?, pilihan_d = ?, jawaban_benar = ? 
     WHERE id_quiz = ?`,
    [pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, quizId]
  );
  
  return { id_quiz: quizId, ...quizData, affectedRows: result.affectedRows };
}

export async function deleteQuizPJK(quizId) {
  // Delete user answers related to this quiz if needed
  // await pool.query('DELETE FROM user_answers WHERE id_quiz = ?', [quizId]);
  
  // Delete the quiz
  const [result] = await pool.query('DELETE FROM quiz_pjk WHERE id_quiz = ?', [quizId]);
  return { affectedRows: result.affectedRows };
}

// ===========================================
// SBD Admin Dashboard Functions
// ===========================================
export async function createSubmoduleSBD(submoduleData) {
  const { judul_submodul, video_url, pdf_url, id_modul } = submoduleData;
  const [result] = await pool.query(
    'INSERT INTO submodul_sbd (judul_submodul, video_url, pdf_url, id_modul) VALUES (?, ?, ?, ?)',
    [judul_submodul, video_url, pdf_url, id_modul]
  );
  return { id_submodul: result.insertId, ...submoduleData };
}

export async function updateSubmoduleSBD(submoduleId, submoduleData) {
  try {
    const { judul_submodul, video_url, pdf_url } = submoduleData;
    console.log('Updating Submodule:', { submoduleId, judul_submodul, video_url, pdf_url });

    const [result] = await pool.query(
      'UPDATE submodul_sbd SET judul_submodul = ?, video_url = ?, pdf_url = ? WHERE id_submodul = ?',
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

export async function deleteSubmoduleSBD(submoduleId) {
  // First delete associated quizzes
  await pool.query('DELETE FROM quiz_sbd WHERE id_submodul = ?', [submoduleId]);
  
  // Then delete the submodule
  const [result] = await pool.query('DELETE FROM submodul_sbd WHERE id_submodul = ?', [submoduleId]);
  return { affectedRows: result.affectedRows };
}

// Quiz Admin Functions for SBD
export async function createQuizSBD(quizData) {
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
    `INSERT INTO quiz_sbd 
     (id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar]
  );
  
  return { id_quiz: result.insertId, ...quizData };
}

export async function updateQuizSBD(quizId, quizData) {
  const { 
    pertanyaan, 
    pilihan_a, 
    pilihan_b, 
    pilihan_c, 
    pilihan_d, 
    jawaban_benar 
  } = quizData;
  
  const [result] = await pool.query(
    `UPDATE quiz_sbd 
     SET pertanyaan = ?, pilihan_a = ?, pilihan_b = ?, pilihan_c = ?, pilihan_d = ?, jawaban_benar = ? 
     WHERE id_quiz = ?`,
    [pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, quizId]
  );
  
  return { id_quiz: quizId, ...quizData, affectedRows: result.affectedRows };
}

export async function deleteQuizSBD(quizId) {
  // Delete the quiz
  const [result] = await pool.query('DELETE FROM quiz_sbd WHERE id_quiz = ?', [quizId]);
  return { affectedRows: result.affectedRows };
}

// ===========================================
// Mulmed Admin Dashboard Functions
// ===========================================
export async function createSubmoduleMulmed(submoduleData) {
  const { judul_submodul, video_url, pdf_url, id_modul } = submoduleData;
  const [result] = await pool.query(
    'INSERT INTO submodul_mulmed (judul_submodul, video_url, pdf_url, id_modul) VALUES (?, ?, ?, ?)',
    [judul_submodul, video_url, pdf_url, id_modul]
  );
  return { id_submodul: result.insertId, ...submoduleData };
}

export async function updateSubmoduleMulmed(submoduleId, submoduleData) {
  try {
    const { judul_submodul, video_url, pdf_url } = submoduleData;
    console.log('Updating Mulmed Submodule:', { submoduleId, judul_submodul, video_url, pdf_url });

    const [result] = await pool.query(
      'UPDATE submodul_mulmed SET judul_submodul = ?, video_url = ?, pdf_url = ? WHERE id_submodul = ?',
      [judul_submodul, video_url, pdf_url, submoduleId]
    );

    console.log('Update Result:', result);

    if (result.affectedRows === 0) {
      throw new Error('No Mulmed submodule found with this ID');
    }

    return { id_submodul: submoduleId, ...submoduleData, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Mulmed Submodule Update Error:', error);
    throw error;
  }
}

export async function deleteSubmoduleMulmed(submoduleId) {
  // Delete associated quizzes first
  await pool.query('DELETE FROM quiz_mulmed WHERE id_submodul = ?', [submoduleId]);

  // Then delete the submodule
  const [result] = await pool.query('DELETE FROM submodul_mulmed WHERE id_submodul = ?', [submoduleId]);
  return { affectedRows: result.affectedRows };
}

export async function createQuizMulmed(quizData) {
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
    `INSERT INTO quiz_mulmed 
     (id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_submodul, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar]
  );

  return { id_quiz: result.insertId, ...quizData };
}

export async function updateQuizMulmed(quizId, quizData) {
  const { 
    pertanyaan, 
    pilihan_a, 
    pilihan_b, 
    pilihan_c, 
    pilihan_d, 
    jawaban_benar 
  } = quizData;

  const [result] = await pool.query(
    `UPDATE quiz_mulmed 
     SET pertanyaan = ?, pilihan_a = ?, pilihan_b = ?, pilihan_c = ?, pilihan_d = ?, jawaban_benar = ? 
     WHERE id_quiz = ?`,
    [pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, quizId]
  );

  return { id_quiz: quizId, ...quizData, affectedRows: result.affectedRows };
}

export async function deleteQuizMulmed(quizId) {
  const [result] = await pool.query('DELETE FROM quiz_mulmed WHERE id_quiz = ?', [quizId]);
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


// ============================================
// Batas Kode Farhan || Update 21 Mei 2025
// ============================================




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

// ===========================================
// Kode baru airin
// ===========================================

//Function get TP untuk Asprak di halaman utama tp-pendahuluan_asprak
export async function getTugasPendahuluanForAsprak(praktikumId, pertemuanId = null) {
  try {
    let query = `
      SELECT 
        ta.id_attempts,
        ta.id_praktikum,
        ta.id_pertemuan,
        ta.id_user,
        ta.total_score,
        ta.completed_at,
        u.full_name AS nama_praktikan,
        u.nim,
        u.email
      FROM tp_attempts ta
      JOIN users u ON ta.id_user = u.id_user
      WHERE ta.id_praktikum = ?
    `;
    
    const params = [praktikumId];

    if (pertemuanId && pertemuanId !== 'all') {
      query += ` AND ta.id_pertemuan = ?`;
      params.push(pertemuanId);
    }

    const [rows] = await pool.query(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error saat mengambil data tugas pendahuluan details untuk asprak:', error);
    return { success: false, message: 'Database error' };
  }
}

//Function get TP Details untuk Asprak di halaman detail tp-pendahuluan_asprak/detail/[id_attempts]
export async function getTPAttemptDetails(id_attempts) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        tad.id_attempts_details,
        tad.id_soal,
        ts.pertanyaan,
        tad.tp_answer,
        tad.score_awarded
      FROM tp_attempt_details tad
      JOIN tp_soal ts ON ts.id_soal = tad.id_soal
      WHERE tad.id_attempts = ?
    `, [id_attempts]);

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error saat mengambil detail TP attempts:', error);
    return { success: false, message: 'Database error' };
  }
}

//function untuk mendapatkan jawaban tp berdasarkan kolom id_attempts_detail dari tabel tp_attempt_detail
// Add these functions to your database file (same file with getTotalScoreAwarded)

export async function getTPAnswerByIdDetails(id_attempts_details) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tp_attempt_details WHERE id_attempts_details = ?',
      [id_attempts_details]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting TP answer:', error);
    throw error;
  }
}

//function yg kirim nilai prediksi ML ke KOLOM PREDIKSI ML hehehe
export async function updatePredictedScore(id_attempts_details, score) {
  try {
    const [result] = await pool.query(
      'UPDATE tp_attempt_details SET re_awarded = ? WHERE id_attempts_details = ?',
      [score, id_attempts_details]
    );
    return result.affectedRows;
  } catch (error) {
    console.error('Error updating predicted score:', error);
    throw error;
  }
}
//function untuk update/konfirmasi nilai secara manual setelah nilai keluar dari prediksi ML 
export async function updateConfirmedScore(id_attempts_details, score_awarded) { 
  try {
    const [result] = await pool.query(`
      UPDATE tp_attempt_details
      SET score_awarded = ?
      WHERE id_attempts_details = ?
    `, [score_awarded, id_attempts_details]);

    return { success: true, data: result };
  } catch (error) {
    console.error('Error saat mengupdate skor konfirmasi:', error);
    return { success: false, message: 'Database error' };
  }
}

//untuk get fullname praktikan di halaman detail tp
export async function getFullNameByIdAttempts(id_attempts) {
  try {
    const [rows] = await pool.query(`
      SELECT u.full_name 
      FROM users u
      INNER JOIN tp_attempts ta ON u.id_user = ta.id_user
      WHERE ta.id_attempts = ?
    `, [id_attempts]);

    return rows[0]; // return objek dengan property full_name
  } catch (error) {
    console.error('Error saat ambil full_name by id_attempts:', error);
    return null;
  }
}

// Pastikan function ini ada dan tidak ada error
export async function getPraktikumPertemuanByAttempts(id_attempts) {
  let connection;
  
  try {
    console.log('=== START DATABASE FUNCTION ===');
    console.log('Getting connection...');
    
    connection = await pool.getConnection();
    console.log('Connection established');
    
    const query = `
      SELECT 
        p.name AS praktikum_name,
        pt.pertemuan_ke
      FROM tp_attempts a
      JOIN pertemuan pt ON a.id_pertemuan = pt.id_pertemuan
      JOIN praktikum p ON pt.id_praktikum = p.id_praktikum
      WHERE a.id_attempts = ?
    `;
    
    console.log('Executing query:', query);
    console.log('With parameter:', id_attempts);
    
    const [rows] = await connection.execute(query, [id_attempts]);
    
    console.log('Query executed successfully');
    console.log('Rows returned:', rows.length);
    console.log('First row:', rows[0]);
    
    if (rows.length === 0) {
      console.log('No data found for id_attempts:', id_attempts);
      return {
        success: true,
        data: null,
        message: 'No data found'
      };
    }
    
    const result = {
      success: true,
      data: rows[0],
      message: 'Data found successfully'
    };
    
    console.log('Returning result:', result);
    console.log('=== END DATABASE FUNCTION ===');
    
    return result;

  } catch (error) {
    console.error('=== DATABASE FUNCTION ERROR ===');
    console.error('Database error in getPraktikumPertemuanByAttempts:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('=== END DATABASE FUNCTION ERROR ===');
    
    return {
      success: false,
      data: null,
      message: 'Database query failed',
      error: error.message
    };
  } finally {
    if (connection) {
      console.log('Releasing database connection...');
      connection.release();
    }
  }
}

//function untuk SUM semua skor per soal per 1 id_attempts_details
export async function getTotalScoreAwarded(id_attempts) {
  const [rows] = await pool.query(
    'SELECT SUM(score_awarded) AS total_score_awarded FROM tp_attempt_details WHERE id_attempts = ?',
    [id_attempts]
  );
  return rows[0].total_score_awarded || 0;
}

// Fungsi untuk update total_score di tabel tp_attempts (tapi belom kepake)
export async function updateTotalScore(id_attempts, total_score) {
  const [result] = await pool.query(
    'UPDATE tp_attempts SET total_score = ? WHERE id_attempts = ?',
    [total_score, id_attempts]
  );
  return result.affectedRows;
}

export async function getPredictedScore(id_attempts_details) {
  try {
    const [rows] = await pool.query(
      `SELECT re_awarded FROM tp_attempt_details WHERE id_attempts_details = ?`,
      [id_attempts_details]
    );
    return rows[0]; // { re_awarded: ... }
  } catch (error) {
    console.error('Error fetching predicted score:', error);
    return null;
  }
}


export async function calculateAndUpdateTotalScore(id_attempts) {
  const connection = await pool.getConnection();
  
  try {
    // Validasi input parameter
    console.log('Input id_attempts:', id_attempts, 'Type:', typeof id_attempts);
    
    if (!id_attempts || isNaN(parseInt(id_attempts))) {
      throw new Error('Parameter id_attempts tidak valid atau kosong');
    }
    
    const validIdAttempts = parseInt(id_attempts);
    console.log('Validated id_attempts:', validIdAttempts);
    
    await connection.beginTransaction();
    
    // 1. Cek apakah id_attempts exists di tabel tp_attempts
    const [attemptsCheck] = await connection.query(`
      SELECT id_attempts FROM tp_attempts WHERE id_attempts = ?
    `, [validIdAttempts]);
    
    if (attemptsCheck.length === 0) {
      throw new Error(`ID attempts ${validIdAttempts} tidak ditemukan di tabel tp_attempts`);
    }
    
    // 2. Ambil semua score_awarded berdasarkan id_attempts
    const [scoreRows] = await connection.query(`
      SELECT score_awarded 
      FROM tp_attempt_details 
      WHERE id_attempts = ? AND score_awarded IS NOT NULL
    `, [validIdAttempts]);
    
    console.log('Score rows found:', scoreRows.length);
    console.log('Score data:', scoreRows);
    
    if (scoreRows.length === 0) {
      throw new Error('Tidak ada nilai yang tersedia untuk id_attempts ini. Pastikan semua soal sudah dinilai.');
    }
    
    // 3. Hitung total score dan jumlah soal
    const totalScore = scoreRows.reduce((sum, row) => {
      const score = parseFloat(row.score_awarded) || 0;
      return sum + score;
    }, 0);
    const jumlahSoal = scoreRows.length;
    
    console.log('Total individual scores:', totalScore);
    console.log('Jumlah soal:', jumlahSoal);
    
    // 4. Hitung final score dengan rumus: (sum nilai / jumlah nilai) * 20
    const finalScore = (totalScore / jumlahSoal) * 20;
    const roundedFinalScore = Math.round(finalScore * 100) / 100;
    
    console.log('Final score before rounding:', finalScore);
    console.log('Final score after rounding:', roundedFinalScore);
    
    // 5. Update total_score di tabel tp_attempts
    const [updateResult] = await connection.query(`
      UPDATE tp_attempts 
      SET total_score = ? 
      WHERE id_attempts = ?
    `, [roundedFinalScore, validIdAttempts]);
    
    console.log('Update result:', updateResult);
    
    if (updateResult.affectedRows === 0) {
      throw new Error('Gagal mengupdate total score, id_attempts tidak ditemukan');
    }
    
    await connection.commit();
    
    return {
      success: true,
      data: {
        id_attempts: validIdAttempts,
        total_individual_scores: totalScore,
        jumlah_soal: jumlahSoal,
        final_score: roundedFinalScore,
        calculation: `(${totalScore} / ${jumlahSoal}) * 20 = ${roundedFinalScore}`
      },
      message: 'Total score berhasil dihitung dan diupdate'
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('Error dalam calculateAndUpdateTotalScore:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      message: error.message || 'Database error saat menghitung total score'
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Panggil testDatabaseQueries hanya jika file ini dijalankan langsung, bukan diimpor
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseQueries()
}

export default pool