import express from 'express';
import { upload } from './config/multer.config';
import { createNotice } from './app/modules/notification/notification.controller';

const router = express.Router();

// Multer attached here, field name MUST be 'file'
router.post('/notices', upload.single('file'), createNotice);

export default router;
