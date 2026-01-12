import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNoticeStatus,
} from './notification.controller';

const router = Router();

// ----------------- Multer Setup -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ----------------- Routes -----------------

// Create notice with optional image upload
// router.post('/', upload.single('file'), createNotice);
// router.post('/', upload.any(), createNotice);
router.post('/', upload.single('file'), createNotice);

// Get all notices
router.get('/', getAllNotices);

// Get single notice by ID
router.get('/:id', getSingleNotice);

// Update notice status
router.patch('/:id/status', updateNoticeStatus);

export const NoticeRouters = router;
