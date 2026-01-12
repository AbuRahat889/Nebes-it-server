import express from 'express';
import { NoticeRouters } from '../modules/notification/notification.routes';
const router = express.Router();

const moduleRoutes = [{ path: '/notices', route: NoticeRouters }];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
