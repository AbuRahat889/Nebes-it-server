import { Router } from 'express';
import {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNoticeStatus,
} from './notification.controller';

const router = Router();

// ----------------- Routes -----------------
router.post('/', createNotice);

// Get all notices
router.get('/', getAllNotices);

// Get single notice by ID
router.get('/:id', getSingleNotice);

// Update notice status
router.patch('/:id/status', updateNoticeStatus);

export const NoticeRouters = router;
