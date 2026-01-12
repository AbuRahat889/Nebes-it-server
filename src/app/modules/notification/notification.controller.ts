import { NoticeStatus, NoticeType, TargetType } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

/**
 * CREATE NOTICE
 */

export const createNotice = async (req: Request, res: Response) => {
  try {
    // Parse notice JSON sent in 'notice' field
    const noticeData = req.body.notice ? JSON.parse(req.body.notice) : {};
    const { title, body, publishDate, targetType, noticeType } = noticeData;

    if (!title || !body || !publishDate || !targetType || !noticeType) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
    }

    let attachmentData;

    const file = req.file; // single file from Multer (memory storage)

    if (file) {
      // Upload to ImgBB
      const form = new FormData();
      form.append('image', file.buffer.toString('base64')); // buffer → base64
      form.append('name', file.originalname);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        form,
        { headers: form.getHeaders() },
      );

      attachmentData = {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileUrl: response.data.data.url, // ImgBB URL
      };

      // Optional: Save local copy
      // const fs = require('fs');
      // const path = require('path');
      // const localPath = path.join(process.cwd(), 'uploads', `${Date.now()}-${file.originalname}`);
      // fs.writeFileSync(localPath, file.buffer);
      // attachmentData.localPath = localPath;
    }

    // Save notice in Prisma
    const notice = await prisma.notice.create({
      data: {
        ...noticeData,
        publishDate: new Date(noticeData.publishDate),
        attachments: attachmentData ? { create: attachmentData } : undefined,
      },
      include: { attachments: true },
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create notice', error });
  }
};

/**
 * GET ALL NOTICES
 * ?status=DRAFT | PUBLISHED
 */
export const getAllNotices = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const notices = await prisma.notice.findMany({
      where: status ? { status: status as NoticeStatus } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: notices.length, data: notices });
  } catch (error) {
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
