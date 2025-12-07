import { Request, Response } from 'express';
import prisma from '../config/database.js';

export const getAllMemos = async (req: Request, res: Response) => {
    try {
        const { userId, categoryId, isPinned, isArchived } = req.query;

        const memos = await prisma.memo.findMany({
            where: {
                ...(userId && { userId: userId as string }),
                ...(categoryId && { categoryId: categoryId as string }),
                ...(isPinned !== undefined && { isPinned: isPinned === 'true' }),
                ...(isArchived !== undefined && { isArchived: isArchived === 'true' }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                category: true,
            },
            orderBy: [
                { isPinned: 'desc' },
                { updatedAt: 'desc' },
            ],
        });

        res.json({ success: true, data: memos });
    } catch (error) {
        console.error('Error fetching memos:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch memos' });
    }
};

export const getMemoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const memo = await prisma.memo.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                category: true,
            },
        });

        if (!memo) {
            return res.status(404).json({ success: false, error: 'Memo not found' });
        }

        res.json({ success: true, data: memo });
    } catch (error) {
        console.error('Error fetching memo:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch memo' });
    }
};

export const createMemo = async (req: Request, res: Response) => {
    try {
        const { title, content, userId, categoryId, isPinned } = req.body;

        if (!title || !content || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Title, content, and userId are required',
            });
        }

        const memo = await prisma.memo.create({
            data: {
                title,
                content,
                userId,
                categoryId: categoryId || null,
                isPinned: isPinned || false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                category: true,
            },
        });

        res.status(201).json({ success: true, data: memo });
    } catch (error) {
        console.error('Error creating memo:', error);
        res.status(500).json({ success: false, error: 'Failed to create memo' });
    }
};

export const updateMemo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, categoryId, isPinned, isArchived } = req.body;

        const memo = await prisma.memo.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(categoryId !== undefined && { categoryId }),
                ...(isPinned !== undefined && { isPinned }),
                ...(isArchived !== undefined && { isArchived }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                category: true,
            },
        });

        res.json({ success: true, data: memo });
    } catch (error) {
        console.error('Error updating memo:', error);
        res.status(500).json({ success: false, error: 'Failed to update memo' });
    }
};

export const deleteMemo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.memo.delete({
            where: { id },
        });

        res.json({ success: true, message: 'Memo deleted successfully' });
    } catch (error) {
        console.error('Error deleting memo:', error);
        res.status(500).json({ success: false, error: 'Failed to delete memo' });
    }
};
