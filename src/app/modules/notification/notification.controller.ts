import { NoticeStatus, NoticeType, TargetType } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { calculatePagination } from '../../utils/calculatePagination';

/**
 * CREATE NOTICE
 */
export const createNotice = async (req: Request, res: Response) => {
  try {
    let noticeData;

    // ✅ Handle all cases safely
    if (req.body.notice) {
      noticeData =
        typeof req.body.notice === 'string'
          ? JSON.parse(req.body.notice)
          : req.body.notice;
    } else {
      noticeData = req.body;
    }

    // ✅ Guard clause
    if (!noticeData) {
      return res.status(400).json({
        success: false,
        message: 'Notice data is missing',
      });
    }

    const {
      title,
      body,
      publishDate,
      targetType,
      noticeType,
      employeeId,
      employeeName,
      position,
      attachments,
    } = noticeData;

    // ✅ Required field validation
    if (!title || !body || !publishDate || !targetType || !noticeType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // ✅ Enum validation (CRITICAL)
    if (!Object.values(TargetType).includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid targetType',
      });
    }

    if (!Object.values(NoticeType).includes(noticeType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid noticeType',
      });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        body,
        publishDate: new Date(publishDate),
        targetType,
        noticeType,
        status: NoticeStatus.DRAFT,
        employeeId,
        employeeName,
        position,
        attachments,
      },
    });

    return res.status(201).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Create Notice Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create notice',
    });
  }
};

/**
 * GET ALL NOTICES
 * ?status=DRAFT | PUBLISHED
 */
export const getAllNotices = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      employeeName,
      targetType,
      status,
      publishDate,
    } = req.query;

    const {
      skip,
      limit: take,
      sortBy: sortField,
      sortOrder: sortDir,
    } = calculatePagination({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sortBy: (sortBy as string) || 'createdAt',
      sortOrder: (sortOrder as string) || 'desc',
    });

    const filters: any = {};

    if (employeeName?.toString().trim()) {
      filters.employeeName = {
        contains: employeeName.toString(),
        mode: 'insensitive',
      };
    }

    if (targetType?.toString().trim()) {
      filters.targetType = targetType.toString();
    }

    if (status?.toString().trim()) {
      filters.status = status.toString() as NoticeStatus;
    }

    if (publishDate?.toString().trim()) {
      const start = new Date(publishDate.toString());
      start.setHours(0, 0, 0, 0);
      const end = new Date(publishDate.toString());
      end.setHours(23, 59, 59, 999);
      filters.publishDate = { gte: start, lte: end };
    }

    // Fetch paginated notices
    const notices = await prisma.notice.findMany({
      where: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: { [sortField]: sortDir },
      skip,
      take,
    });

    // Total notices matching filters
    const total = await prisma.notice.count({
      where: Object.keys(filters).length > 0 ? filters : undefined,
    });

    // Total published notices (Active)
    const totalActive = await prisma.notice.count({
      where: { status: 'PUBLISHED' },
    });

    // Total draft notices
    const totalDraft = await prisma.notice.count({
      where: { status: 'DRAFT' },
    });

    res.json({
      success: true,
      meta: {
        page: Number(page) || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        totalActive,
        totalDraft,
      },
      data: notices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notices',
      error: (error as Error).message,
    });
  }
};

/**
 * UPDATE NOTICE STATUS
 */
export const updateNoticeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(NoticeStatus).includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status value' });
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notice status',
      error: (error as Error).message,
    });
  }
};

/**
 * GET SINGLE NOTICE
 */
export const getSingleNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findFirst({ where: { id } });

    if (!notice) {
      return res
        .status(404)
        .json({ success: false, message: 'Notice not found' });
    }

    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notice',
      error: (error as Error).message,
    });
  }
};
