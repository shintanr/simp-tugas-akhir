import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "server/video_file");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    let title = req.body.title || "file"; // Get title or default to "file"

    // Clean characters that shouldn't be in filenames
    title = title.replace(/[^a-zA-Z0-9-_]/g, "_"); 

    cb(null, `${title}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Create multer instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true); // Allow all file types
  }
});

export default upload;