import { Request, Response } from 'express';
import prisma from '../config/database.js';

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { memos: true },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                memos: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        updatedAt: 'desc',
                    },
                },
            },
        });

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        res.json({ success: true, data: category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch category' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required',
            });
        }

        const category = await prisma.category.create({
            data: {
                name,
                color: color || null,
            },
        });

        res.status(201).json({ success: true, data: category });
    } catch (error: any) {
        console.error('Error creating category:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, error: 'Category name already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create category' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        const category = await prisma.category.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(color !== undefined && { color }),
            },
        });

        res.json({ success: true, data: category });
    } catch (error: any) {
        console.error('Error updating category:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, error: 'Category name already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to update category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.category.delete({
            where: { id },
        });

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, error: 'Failed to delete category' });
    }
};
