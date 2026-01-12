import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Optional: if you want to save a local copy
const uploadFolder = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadFolder))
  fs.mkdirSync(uploadFolder, { recursive: true });

// Memory storage (file in buffer)
const storage = multer.memoryStorage();

export const upload = multer({ storage });
