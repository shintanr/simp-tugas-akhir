import express from "express";
import cors from "cors";
import morgan from "morgan";
import labRoutes from "./routes/labRoutes.js";
import praktikumRoutes from "./routes/praktikumRoutes.js";
import userPraktikumRoutes from "./routes/userPraktikumRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import { verifyToken } from "./middlewares/authMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import presensiRoutes from "./routes/presensiRoutes.js";
import penilaianRoutes from "./routes/penilaianRoutes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

 // import dari kode farhan
import { 
  getLabs, 
  getModulesAllByPraktikumId, 
  getPraktikumByLabId, 
  getSubModulesSDLByModulId, 
  getSubModulesEldasByModulId, 
  getVideosSubModulesEldasBySubModulId, 
  getVideosSubModulesSDLBySubModulId, 
  getQuizEldasBySubModulId, 
  getQuizSDLBySubModulId,
  checkAnswer, 
  createModule,
  updateModule, 
  deleteModule, 
  createSubmoduleSDL, 
  updateSubmoduleSDL, 
  deleteSubmoduleSDL,
  createQuizEldas,
  createQuizSDL,
  updateQuizEldas,
  updateQuizSDL,
  deleteQuizSDL,
  deleteQuizEldas,
  createSubmoduleEldas,
  updateSubmoduleEldas,
  deleteSubmoduleEldas} from "./config/database.js";


// import dari kode airin
import { getPraktikumById, 
  getAllTpByPraktikum,
  getFilteredSubmissionsPraktikanForAsprak,
  getSubmissionPraktikanDetailById,
  saveAsistensi,
  getSubmissionsPraktikanForAsprak,
  getTpSoalByPraktikumAndPertemuan,
  getSubmissionFilePath,
  deleteSubmission, 
  getPertemuan, 
  getPraktikum, 
  pool } from "./config/database.js";




dotenv.config();

const app = express();
const PORT = 8080;


app.use(cors({
  origin: "http://localhost:3000", // frontend origin
  credentials: true,               // agar cookie dikirim
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());


// kode farhan

const uploadDir = path.join(process.cwd(), "server/video_file");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/server/video_file", express.static(uploadDir));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    let title = req.body.title || "file"; // Ambil judul atau default ke "video"

    // Bersihkan karakter yang tidak boleh ada di nama file
    title = title.replace(/[^a-zA-Z0-9-_]/g, "_"); 

    cb(null, `${title}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true); // Mengizinkan semua jenis file
  }
});

// batas kode farhan

// Gunakan routes yang sudah modular
app.use("/api/auth", authRoutes);
app.use("/api", labRoutes);
app.use("/api", complaintRoutes);
app.use("/api", praktikumRoutes);
app.use("/api", userPraktikumRoutes);
app.use("/api", userRoutes); 
app.use("/api", presensiRoutes);
app.use('/api/penilaian', penilaianRoutes);

// proteksi api dengan middleware 
app.use("/api/protected", protectedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});


// =============================================
// Kode Farhan

app.get("/api/lab", async (req, res) => {
  try {
    const labs = await getLabs();
    res.json({
      message: "List of Labs from Database",
      data: labs.map((lab) => lab.name), // Pastikan tabel memiliki kolom 'name'
    });
  } catch (error) {
    console.error("Error fetching labs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/lab/:labId", async (req, res) => {
  try {
    const { labId } = req.params;
    const praktikum = await getPraktikumByLabId(labId);
    
    res.json({
      message: `List of Praktikum for Lab ID ${labId}`,
      data: praktikum,
    });
  } catch (error) {
    console.error("Error fetching praktikum:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/praktikum/modul/:prakId", async (req, res) => {
  try{
    const { prakId } = req.params;
    const module = await getModulesAllByPraktikumId(prakId);

    res.json({
      message: `List of Module Praktikum Elektronika Dasar ${prakId}`,
      data: module,
    });
  } catch (error) {
    console.error("error fetching module:", error);
    res.status(500).json({ message: "Internal Server Error"});
  }
})

app.get("/api/praktikum/submodul/prak-eldas/:modulId", async (req, res) => {
  try{
    const { modulId } = req.params;
    const subModules = await getSubModulesEldasByModulId(modulId);

    res.json({
      message: `Sub Modules of Modul Prak Eldas ${modulId}`,
      data: subModules,
    });
  } catch (error) {
    console.error("error fetching modules:", error);
    res.status(500).json({ message: "Internal Server Error"});
  }
})

app.get("/api/praktikum/submodul/prak-sdl/:modulId", async (req, res) => {
  try{
    const { modulId } = req.params;
    const subModules = await getSubModulesSDLByModulId(modulId);

    res.json({
      message: `Sub Modules of Modul Prak Eldas ${modulId}`,
      data: subModules,
    });
  } catch (error) {
    console.error("error fetching modules:", error);
    res.status(500).json({ message: "Internal Server Error"});
  }
})

app.post("/api/submodul/upload-video/eldas/:submodulId", upload.single("file"), async (req, res) => {
  try {
    const { submodulId } = req.params;
    const videoUrl = `http://localhost:8080/server/video_file/${req.file.filename}`;

    // Debugging: Cek apakah submodulId benar
    console.log("Updating submodulId:", submodulId);
    console.log("New video URL:", videoUrl);

    const result = await pool.query("UPDATE submodul_eldas SET video_url = ? WHERE id_submodul = ?", [videoUrl, submodulId]);

    // Debugging: Pastikan update berhasil
    console.log("Database update result:", result);

    res.json({ message: "Video uploaded successfully", videoUrl });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/submodul/upload-video/sdl/:submodulId", upload.single("file"), async (req, res) => {
  try {
    const { submodulId } = req.params;
    const videoUrl = `http://localhost:8080/server/video_file/${req.file.filename}`;

    // Debugging: Cek apakah submodulId benar
    console.log("Updating submodulId:", submodulId);
    console.log("New video URL:", videoUrl);

    const result = await pool.query("UPDATE submodul_sdl SET video_url = ? WHERE id_submodul = ?", [videoUrl, submodulId]);

    // Debugging: Pastikan update berhasil
    console.log("Database update result:", result);

    res.json({ message: "Video uploaded successfully", videoUrl });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/api/submodul/video/eldas/:submodulId", async (req, res) => {
  try{
    const { submodulId } = req.params;
    const videos = await getVideosSubModulesEldasBySubModulId(submodulId);

    res.json({
      message: `Sub Modules of Modul 1 Prak Eldas ${submodulId}`,
      data: videos,
    });
  } catch (error) {
    console.error("error fetching modules:", error);
    res.status(500).json({ message: "Internal Server Error"});
  }
})

app.get("/api/submodul/video/sdl/:submodulId", async (req, res) => {
  try{
    const { submodulId } = req.params;
    const videos = await getVideosSubModulesSDLBySubModulId(submodulId);

    res.json({
      message: `Sub Modules of Modul 1 Prak SDL ${submodulId}`,
      data: videos,
    });
  } catch (error) {
    console.error("error fetching modules:", error);
    res.status(500).json({ message: "Internal Server Error"});
  }
})

app.get('/api/submodul/quiz-eldas/:submodulId', async (req, res) => {
  const { submodulId } = req.params;
  try {
    const quiz = await getQuizEldasBySubModulId(submodulId);
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/submodul/quiz-sdl/:submodulId', async (req, res) => {
  const { submodulId } = req.params;
  try {
    const quiz = await getQuizSDLBySubModulId(submodulId);
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/submodul/quiz/check-answer', async (req, res) => {
  const { quizId, userAnswer } = req.body;

  try {
    const result = await checkAnswer(quizId, userAnswer);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/submodul/quiz/submit", async (req, res) => {
  try {
    console.log("Incoming data:", req.body); // Debug: Cek apakah data dari frontend sampai ke backend

    const { user_id, id_quiz, user_answer } = req.body;

    // Validasi input (mencegah data kosong)
    if (!user_id || !id_quiz || !user_answer) {
      console.error("Error: Data tidak lengkap", req.body);
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Coba eksekusi query ke database
    const [result] = await pool.query(
      `INSERT INTO user_answers (user_id, id_quiz, user_answer) VALUES (?, ?, ?)`,
      [user_id, id_quiz, user_answer]
    );

    console.log("Query success:", result); // Debug: Cek apakah query sukses
    res.json({ success: true, message: "Answer submitted successfully", result });
  } catch (error) {
    console.error("Error submitting answer:", error); // Debug: Lihat error detailnya
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

// =============================================
// MODULE MANAGEMENT ROUTES
// =============================================

// Get all modules for a praktikum (reusing existing function)
app.get('/admin/get/modul/:praktikumId', async (req, res) => {
  try {
    const praktikumId = parseInt(req.params.praktikumId);
    const modules = await getModulesAllByPraktikumId(praktikumId);
    
    res.status(200).json({
      status: 'success',
      data: modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch modules',
      error: error.message
    });
  }
});

// Create a new module
app.post('/admin/post/modul', async (req, res) => {
  try {
    const { judul_modul, id_praktikum } = req.body;
    if (!judul_modul || !id_praktikum) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Kirim keduanya ke createModule
    const newModule = await createModule({ judul_modul, id_praktikum });
    res.status(201).json({
      status: 'success',
      data: newModule,
      message: 'Module created successfully'
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create module',
      error: error.message
    });
  }
});


// Update a module
app.put('/admin/put/modul/:moduleId', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const { judul_modul, video_url } = req.body;
    
    if (!judul_modul) {
      return res.status(400).json({
        status: 'error',
        message: 'Module title is required'
      });
    }
    
    const updatedModule = await updateModule(moduleId, {
      judul_modul,
      video_url: video_url || null
    });
    
    if (updatedModule.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedModule,
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update module',
      error: error.message
    });
  }
});

// Delete a module
app.delete('/admin/delete/modul/:moduleId', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const result = await deleteModule(moduleId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete module',
      error: error.message
    });
  }
});

// =============================================
// SDL SUBMODULE MANAGEMENT ROUTES
// =============================================

// Create a new SDL submodule
app.post('/admin/post/submodul/sdl', upload.fields([
  { name: 'file', maxCount: 1 }, // for PDF
  { name: 'video', maxCount: 1 } // for Video
]), async (req, res) => {
  try {
    const { judul_submodul, id_modul } = req.body;
    console.log("Received body:", req.body);
    console.log("Received files:", req.files);
    
    // Validasi field wajib
    if (!judul_submodul || !id_modul) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: judul_submodul or id_modul'
      });
    }
    
    // Process file uploads and get URLs
    let pdfUrl = null;
    let videoUrl = null;
    
    if (req.files && req.files['file'] && req.files['file'][0]) {
      pdfUrl = `http://localhost:8080/server/video_file/${req.files['file'][0].filename}`;
    }
    
    if (req.files && req.files['video'] && req.files['video'][0]) {
      videoUrl = `http://localhost:8080/server/video_file/${req.files['video'][0].filename}`;
    }
    
    // Buat objek submodul baru
    const newSubmoduleData = {
      judul_submodul,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      id_modul: parseInt(id_modul) // Convert to number to ensure proper type
    };
    
    console.log("Preparing to insert:", newSubmoduleData);
    
    // Insert ke database
    const newSubmodule = await createSubmoduleSDL(newSubmoduleData);
    
    res.status(201).json({
      status: 'success',
      data: newSubmodule,
      message: 'SDL submodule created successfully'
    });
  } catch (error) {
    console.error('Error creating SDL submodule:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create SDL submodule',
      error: error.message
    });
  }
});

app.put('/admin/put/submodul/sdl/:submoduleId', upload.fields([
  { name: 'file', maxCount: 1 },  // for pdf
  { name: 'video', maxCount: 1 }  // for video
]), async (req, res) => {
  try {
    const submoduleId = parseInt(req.params.submoduleId);
    const { judul_submodul, pdf_url, video_url } = req.body;

    if (!judul_submodul) {
      return res.status(400).json({
        status: 'error',
        message: 'Submodule title is required'
      });
    }

    // Prepare update data
    const updateData = {
      judul_submodul
    };

    // Handle PDF file upload
    if (req.files['file']) {
      const pdfUrl = `http://localhost:8080/server/video_file/${req.files['file'][0].filename}`;
      updateData.pdf_url = pdfUrl;
    } else if (pdf_url) {
      updateData.pdf_url = pdf_url;
    }

    // Handle video file upload
    if (req.files['video']) {
      const videoUrl = `http://localhost:8080/server/video_file/${req.files['video'][0].filename}`;
      updateData.video_url = videoUrl;
    } else if (video_url) {
      updateData.video_url = video_url;
    }

    // Update the submodule
    const updatedSubmodule = await updateSubmoduleSDL(submoduleId, updateData);

    if (updatedSubmodule.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'SDL submodule not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...updateData,
        id_submodul: submoduleId
      },
      message: 'SDL submodule updated successfully'
    });
  } catch (error) {
    console.error('Error updating SDL submodule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update SDL submodule',
      error: error.message
    });
  }
});

app.post('/admin/post/quiz/sdl/:id_submodul', async (req, res) => {
  try {
    const { id_submodul } = req.params;
    const quiz = await createQuizSDL({
      ...req.body,
      id_submodul: id_submodul  // pastikan dikirim ke createQuizSDL
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz SDL', details: err.message });
  }
});


app.put('/admin/update/quiz/sdl/:quizId', async (req, res) => {
  try {
    const quizId = req.params.quizId; // Ensure you're using quizId here
    console.log("Quiz ID from URL:", quizId); // Log the quiz ID to see if it's coming in

    const quizData = req.body;
    console.log("Quiz Data:", JSON.stringify(quizData, null, 2));

    // Call the function to update the quiz in the database
    const updatedQuiz = await updateQuizSDL(quizId, quizData);
    
    res.status(200).json({
      message: 'Quiz updated successfully',
      data: updatedQuiz
    });

  } catch (err) {
    console.error("Route Update Error:", err);
    res.status(500).json({ 
      error: 'Failed to update quiz SDL', 
      details: err.message 
    });
  }
});

// Delete
app.delete('/admin/delete/quiz/sdl/:quizId', async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId);
    const result = await deleteQuizSDL(quizId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
});

// Delete an SDL submodule
app.delete('/admin/delete/submodul/sdl/:submoduleId', async (req, res) => {
  try {
    const submoduleId = parseInt(req.params.submoduleId);
    const result = await deleteSubmoduleSDL(submoduleId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'SDL submodule not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'SDL submodule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SDL submodule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete SDL submodule',
      error: error.message
    });
  }
});

// Upload video for SDL submodule
app.post('/admin/post/submodul/sdl/upload-video/:submoduleId', upload.single('file'), async (req, res) => {
  try {
    const { submoduleId } = req.params;
    const videoUrl = `http://localhost:8080/server/video_file/${req.file.filename}`;

    const result = await updateSubmoduleSDL(submoduleId, {
      judul_submodul: req.body.judul_submodul,
      video_url: videoUrl
    });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'SDL submodule not found'
      });
    }

    res.json({ 
      status: 'success',
      message: "Video uploaded and linked to SDL submodule successfully", 
      videoUrl 
    });
  } catch (error) {
    console.error("Error uploading SDL video:", error);
    res.status(500).json({ 
      status: 'error',
      message: "Failed to upload SDL video",
      error: error.message
    });
  }
});

// Create a new ELdas submodule
app.post('/admin/post/submodul/eldas', upload.fields([
  { name: 'file', maxCount: 1 }, // for PDF
  { name: 'video', maxCount: 1 } // for Video
]), async (req, res) => {
  try {
    const { judul_submodul, id_modul } = req.body;
    console.log("Received body:", req.body);
    console.log("Received files:", req.files);
    
    // Validasi field wajib
    if (!judul_submodul || !id_modul) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: judul_submodul or id_modul'
      });
    }
    
    // Process file uploads and get URLs
    let pdfUrl = null;
    let videoUrl = null;
    
    if (req.files && req.files['file'] && req.files['file'][0]) {
      pdfUrl = `http://localhost:8080/server/video_file/${req.files['file'][0].filename}`;
    }
    
    if (req.files && req.files['video'] && req.files['video'][0]) {
      videoUrl = `http://localhost:8080/server/video_file/${req.files['video'][0].filename}`;
    }
    
    // Buat objek submodul baru
    const newSubmoduleData = {
      judul_submodul,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      id_modul: parseInt(id_modul) // Convert to number to ensure proper type
    };
    
    console.log("Preparing to insert:", newSubmoduleData);
    
    // Insert ke database
    const newSubmodule = await createSubmoduleEldas(newSubmoduleData);
    
    res.status(201).json({
      status: 'success',
      data: newSubmodule,
      message: 'Eldas submodule created successfully'
    });
  } catch (error) {
    console.error('Error creating Eldas submodule:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create Eldas submodule',
      error: error.message
    });
  }
});

app.put('/admin/put/submodul/eldas/:submoduleId', upload.fields([
  { name: 'file', maxCount: 1 },  // for pdf
  { name: 'video', maxCount: 1 }  // for video
]), async (req, res) => {
  try {
    const submoduleId = parseInt(req.params.submoduleId);
    const { judul_submodul, pdf_url, video_url } = req.body;

    if (!judul_submodul) {
      return res.status(400).json({
        status: 'error',
        message: 'Submodule title is required'
      });
    }

    // Prepare update data
    const updateData = {
      judul_submodul
    };

    // Handle PDF file upload
    if (req.files['file']) {
      const pdfUrl = `http://localhost:8080/server/video_file/${req.files['file'][0].filename}`;
      updateData.pdf_url = pdfUrl;
    } else if (pdf_url) {
      updateData.pdf_url = pdf_url;
    }

    // Handle video file upload
    if (req.files['video']) {
      const videoUrl = `http://localhost:8080/server/video_file/${req.files['video'][0].filename}`;
      updateData.video_url = videoUrl;
    } else if (video_url) {
      updateData.video_url = video_url;
    }

    // Update the submodule
    const updatedSubmodule = await updateSubmoduleEldas(submoduleId, updateData);

    if (updatedSubmodule.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Eldas submodule not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...updateData,
        id_submodul: submoduleId
      },
      message: 'Eldas submodule updated successfully'
    });
  } catch (error) {
    console.error('Error updating Eldas submodule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update Eldas submodule',
      error: error.message
    });
  }
});

app.post('/admin/post/quiz/eldas/:id_submodul', async (req, res) => {
  try {
    const { id_submodul } = req.params;
    const quiz = await createQuizEldas({
      ...req.body,
      id_submodul: id_submodul  // pastikan dikirim ke createQuizEldas
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz Eldas', details: err.message });
  }
});


app.put('/admin/update/quiz/eldas/:quizId', async (req, res) => {
  try {
    const quizId = req.params.quizId; // Ensure you're using quizId here
    console.log("Quiz ID from URL:", quizId); // Log the quiz ID to see if it's coming in

    const quizData = req.body;
    console.log("Quiz Data:", JSON.stringify(quizData, null, 2));

    // Call the function to update the quiz in the database
    const updatedQuiz = await updateQuizEldas(quizId, quizData);
    
    res.status(200).json({
      message: 'Quiz updated successfully',
      data: updatedQuiz
    });

  } catch (err) {
    console.error("Route Update Error:", err);
    res.status(500).json({ 
      error: 'Failed to update quiz Eldas', 
      details: err.message 
    });
  }
});

// Delete
app.delete('/admin/delete/quiz/eldas/:quizId', async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId);
    const result = await deleteQuizEldas(quizId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
});



// Delete an Eldas submodule
app.delete('/admin/delete/submodul/eldas/:submoduleId', async (req, res) => {
  try {
    const submoduleId = parseInt(req.params.submoduleId);
    const result = await deleteSubmoduleEldas(submoduleId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Eldas submodule not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Eldas submodule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Eldas submodule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete Eldas submodule',
      error: error.message
    });
  }
});

// Upload video for Eldas submodule
app.post('/admin/post/submodul/eldas/upload-video/:submoduleId', upload.single('file'), async (req, res) => {
  try {
    const { submoduleId } = req.params;
    const videoUrl = `http://localhost:8080/server/video_file/${req.file.filename}`;

    const result = await updateSubmoduleEldas(submoduleId, {
      judul_submodul: req.body.judul_submodul,
      video_url: videoUrl
    });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Eldas submodule not found'
      });
    }

    res.json({ 
      status: 'success',
      message: "Video uploaded and linked to Eldas submodule successfully", 
      videoUrl 
    });
  } catch (error) {
    console.error("Error uploading Eldas video:", error);
    res.status(500).json({ 
      status: 'error',
      message: "Failed to upload Eldas video",
      error: error.message
    });
  }
});


// =============================================
// kode airin
// =============================================

app.post("/api/submission/upload", upload.single("file"), async (req, res) => {
  try {
    const { idUser, idPraktikum, idPertemuan, jenis } = req.body;
    const file_path = `http://localhost:8080/server/video_file/${req.file.filename}`;

    console.log("Saving submission:", { idUser, idPraktikum, idPertemuan, jenis, file_path });

    const [result] = await pool.query(
      `INSERT INTO submission_praktikan 
        (id_user, id_praktikum, id_pertemuan, jenis, file_path, status) 
       VALUES (?, ?, ?, ?, ?, 'Submitted')`, // Status default NULL
      [idUser, idPraktikum, idPertemuan, jenis, file_path]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Gagal menyimpan submission" });
    }

    res.json({ message: "Submission uploaded successfully", file_path });
  } catch (error) {
    console.error("Error uploading submission:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/submission/", async (req, res) => {
  try {
    const { idUser, idPraktikum, idPertemuan } = req.query;

    let query = "SELECT * FROM submission_praktikan WHERE 1=1"; //ini user login
    let queryParams = [];

    if (idUser) {
      query += " AND id_user = ?";
      queryParams.push(idUser);
    }
    if (idPraktikum) {
      query += " AND id_praktikum = ?";
      queryParams.push(idPraktikum);
    }
    if (idPertemuan) {
      query += " AND id_pertemuan = ?";
      queryParams.push(idPertemuan);
    }

    const [rows] = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error saat mengambil data submission:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.get("/api/praktikum", async (req, res) => {
  try {
    const praktikum = await getPraktikum();

    if (!praktikum.success) {
      return res.status(404).json({ message: praktikum.message });
    }

    res.json({
      message: "List of Praktikum from Database",
      data: praktikum.data.map((item) => ({
        id: item.id_praktikum,
        name: item.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching praktikum:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/praktikum/:praktikumId", async (req, res) => {
  try {
    const { praktikumId } = req.params;
    console.log('Received praktikumId:', praktikumId);    
    const praktikumDetail = await getPraktikumById(praktikumId);
    console.log('Praktikum Detail Result:', praktikumDetail);

    if (!praktikumDetail.success) {
      console.log('Praktikum not found');
      return res.status(404).json({ message: praktikumDetail.message });
    }

    res.json({
      message: "Detail Praktikum",
      data: praktikumDetail.data
    });
  } catch (error) {
    console.error("Detailed Error fetching praktikum detail:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      errorDetails: error.message 
    });
  }
});


app.get("/api/pertemuan/:praktikumId", async (req, res) => {
  const { praktikumId } = req.params;

  try {
    const pertemuan = await getPertemuan(praktikumId);
    res.json({
      message: "List of Pertemuan from Database",
      data: pertemuan.data,
    });
  } catch (error) {
    console.error("Error fetching pertemuan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint untuk menghapus submission
app.delete("/api/submission/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Mencoba menghapus submission dengan ID: ${id}`);

    // Dapatkan path file sebelum menghapus record
    console.log('Mendapatkan path file...');
    const filePathResult = await getSubmissionFilePath(id);
    console.log('Hasil getSubmissionFilePath:', filePathResult);
    
    if (!filePathResult.success) {
      console.log('Path file tidak ditemukan');
      return res.status(404).json({ message: 'Submission tidak ditemukan' });
    }

    const filePath = filePathResult.data;
    console.log(`Path file: ${filePath}`);

    // Hapus submission
    console.log('Menghapus submission dari database...');
    const deleteResult = await deleteSubmission(id);
    console.log('Hasil deleteSubmission:', deleteResult);

    if (!deleteResult.success) {
      console.log('Submission tidak ditemukan di database');
      return res.status(404).json({ message: 'Submission tidak ditemukan' });
    }

    // Hapus file fisik
    const fullPath = path.join(process.cwd(), "server/video_file", path.basename(filePath));
    console.log(`Menghapus file fisik di: ${fullPath}`);
    
    if (fs.existsSync(fullPath)) {
      console.log('File ditemukan, menghapus...');
      fs.unlinkSync(fullPath);
    } else {
      console.log('File fisik tidak ditemukan');
    }

    console.log('Submission berhasil dihapus');
    res.json({ message: 'Submission berhasil dihapus' });
  } catch (error) {
    console.error('Error detail saat menghapus submission:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Api untuk melihat file submission ke halaman preview
app.get("/api/submission/view/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Dapatkan path file
    const filePathResult = await getSubmissionFilePath(id);
    
    if (!filePathResult.success) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }
    
    const filePath = filePathResult.data;
    const fullPath = path.join(process.cwd(), "server/video_file", path.basename(filePath));
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File tidak ditemukan di server' });
    }
    
    // Set content type berdasarkan ekstensi file
    const fileExtension = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream'; // default
    
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      // Tambahkan type lain jika diperlukan
    }
    
    // Set header content-type
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline'); // Untuk preview di browser
    
    res.sendFile(fullPath);
  } catch (error) {
    console.error('Error saat melihat file submission:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});


//======= API untuk Tugas Pendahuluan -====
// API untuk get tugas pendahuluan by jenis praktikum sajahhh
app.get("/api/tp/:praktikumId", async (req, res) => {
  try {
    const { praktikumId } = req.params;

    // Dapatkan daftar pertemuan dan TP untuk praktikum ini
    const tpResult = await getAllTpByPraktikum(praktikumId);
    
    if (!tpResult.success) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Jika data ditemukan, kembalikan data
    res.json(tpResult.data);

  } catch (error) {
    console.error('Error saat mengambil daftar TP:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// API untuk get tugas pendahuluan by jenis praktikum dan pertemuan (ex: Eldas, Per 1)
app.get("/api/tp/:praktikumId/:pertemuanId", async (req, res) => {
  try {
    const { praktikumId, pertemuanId } = req.params;

    // Dapatkan soal TP
    const soalResult = await getTpSoalByPraktikumAndPertemuan(
      praktikumId, 
      pertemuanId
    );
    
    if (!soalResult.success) {
      return res.status(404).json({ message: 'Soal tidak ditemukan' });
    }

    // Jika soal ditemukan, kembalikan data
    res.json(soalResult.data);

  } catch (error) {
    console.error('Error saat mengambil soal TP:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.post('/api/submit-tp', async (req, res) => {
  try {
    const { praktikumId, pertemuanId, userId, totalScore, jawaban } = req.body;

    const praktikumData = {
      praktikumId,
      pertemuanId,
      userId,
      totalScore
    };

    const detailsData = jawaban.map(item => ({
      id_soal: item.soalId,
      tp_answer: item.jawaban,
      score_awarded: item.skor // Bisa di-generate di backend jika perlu
    }));

    const result = await submitTugasPendahuluan(praktikumData, detailsData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat submit tugas pendahuluan' 
    });
  }
});


/// = Endpoint untuk Submission Asprak =====
// 1. GET: Dapatkan semua submission untuk asprak
app.get('/api/asprak/submissions', async (req, res) => {
  try {
    const { idPraktikum, idPertemuan } = req.query;
    
    // Jika ada parameter filter, gunakan fungsi filter
    if (idPraktikum || idPertemuan) {
      const result = await getFilteredSubmissionsPraktikanForAsprak(idPraktikum, idPertemuan);
      return res.json(result);
    } 
    
    // Jika tidak ada filter, gunakan fungsi yang sudah ada
    const result = await getSubmissionsPraktikanForAsprak();
    return res.json(result);
  } catch (error) {
    console.error('Error fetching submissions for asprak:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data submission' 
    });
  }
});

// 2. GET: Dapatkan detail submission berdasarkan ID
app.get('/api/asprak/submissions/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;
    const result = await getSubmissionPraktikanDetailById(submissionId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result); // Langsung mengembalikan hasil dari fungsi
  } catch (error) {
    console.error('Error fetching submission detail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil detail submission' 
    });
  }
});

// 3. POST: Simpan asistensi dengan upload file revisi
app.post('/api/asprak/submission/asistensi', upload.single('file_revisi'), async (req, res) => {
  try {
    // Persiapkan data asistensi
    const submissionData = {
      id_submission_praktikan: req.body.id_submission_praktikan,
      id_user: req.body.id_user,
      status: req.body.status,
      catatan_asistensi: req.body.catatan_asistensi || null,
      file_revisi_asprak: req.file 
        ? `http://localhost:${PORT}/server/video_file/${req.file.filename}` 
        : null
    };

    // Validasi input wajib
    if (!submissionData.id_submission_praktikan || !submissionData.id_user || !submissionData.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data tidak lengkap' 
      });
    }

    // Simpan asistensi
    const result = await saveAsistensi(submissionData);
    res.json({ 
      success: true, 
      message: 'Asistensi berhasil disimpan', 
      data: result 
    });
  } catch (error) {
    console.error('Error saat menyimpan asistensi:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menyimpan asistensi', 
      errorDetails: error.message 
    });
  }
});


// Solusi alternatif: gunakan URL langsung dari browser
app.get("/api/submission/download/:submissionId", async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const submission = await getSubmissionPraktikanDetailById(submissionId);
    
    if (!submission.success || !submission.data.file_revisi_asprak) {
      return res.status(404).send("File tidak ditemukan");
    }
    
    // Redirect langsung ke URL file
    // Karena file_revisi_asprak sudah berupa URL lengkap
    return res.redirect(submission.data.file_revisi_asprak);
  } catch (error) {
    console.error("Error saat download file:", error);
    res.status(500).send("Error saat download file");
  }
});


// =============================================

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});