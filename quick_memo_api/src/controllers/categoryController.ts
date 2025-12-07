import { Request, Response } from 'express';
import pool from '../config/database.js';
import { randomUUID } from 'crypto';

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT c.*, COUNT(m.id)::int as memo_count
            FROM "Category" c
            LEFT JOIN "Memo" m ON c.id = m."categoryId"
            GROUP BY c.id
            ORDER BY c.name ASC
        `);

        const categories = result.rows.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
            _count: {
                memos: cat.memo_count
            }
        }));

        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const catResult = await pool.query('SELECT * FROM "Category" WHERE id = $1', [id]);

        if (catResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const category = catResult.rows[0];

        const memosResult = await pool.query(`
            SELECT m.*, 
            u.id as user_id, u.email as user_email, u.name as user_name
            FROM "Memo" m
            LEFT JOIN "User" u ON m."userId" = u.id
            WHERE m."categoryId" = $1
            ORDER BY m."updatedAt" DESC
        `, [id]);

        const memos = memosResult.rows.map(row => {
            const {
                user_id, user_email, user_name,
                ...memoData
            } = row;
            return {
                ...memoData,
                user: user_id ? {
                    id: user_id,
                    email: user_email,
                    name: user_name
                } : null
            };
        });

        res.json({ success: true, data: { ...category, memos } });
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

        const id = randomUUID();
        const now = new Date();

        const result = await pool.query(
            'INSERT INTO "Category" (id, name, color, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $4) RETURNING *',
            [id, name, color || null, now]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Error creating category:', error);
        if (error.code === '23505') {
            return res.status(409).json({ success: false, error: 'Category name already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create category' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (color !== undefined) {
            updates.push(`color = $${paramIndex++}`);
            values.push(color);
        }

        let category;
        if (updates.length > 0) {
            updates.push(`"updatedAt" = $${paramIndex++}`);
            values.push(new Date());

            const result = await pool.query(
                `UPDATE "Category" SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                [...values, id]
            );
            category = result.rows[0];
        } else {
            const result = await pool.query(
                `UPDATE "Category" SET "updatedAt" = $1 WHERE id = $2 RETURNING *`,
                [new Date(), id]
            );
            category = result.rows[0];
        }

        // Note: returning null if not found logic was implicit handled by Prisma mostly via errors, 
        // usually we might check if category exists. 
        // If row count is 0, we can ignore or return 404. 
        // The frontend probably expects the updated object.

        res.json({ success: true, data: category });
    } catch (error: any) {
        console.error('Error updating category:', error);
        if (error.code === '23505') {
            return res.status(409).json({ success: false, error: 'Category name already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to update category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM "Category" WHERE id = $1', [id]);

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, error: 'Failed to delete category' });
    }
};
