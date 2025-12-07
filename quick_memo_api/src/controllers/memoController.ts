import { Request, Response } from 'express';
import pool from '../config/database.js';
import { randomUUID } from 'crypto';

export const getAllMemos = async (req: Request, res: Response) => {
    try {
        const { userId, categoryId, isPinned, isArchived } = req.query;

        let query = `
            SELECT m.*, 
                   u.id as user_id, u.email as user_email, u.name as user_name,
                   c.id as category_id, c.name as category_name, c.color as category_color, c."createdAt" as category_created_at, c."updatedAt" as category_updated_at
            FROM "Memo" m
            LEFT JOIN "User" u ON m."userId" = u.id
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (userId) {
            query += ` AND m."userId" = $${paramIndex++}`;
            params.push(userId);
        }
        if (categoryId) {
            query += ` AND m."categoryId" = $${paramIndex++}`;
            params.push(categoryId);
        }
        if (isPinned !== undefined) {
            query += ` AND m."isPinned" = $${paramIndex++}`;
            params.push(isPinned === 'true');
        }
        if (isArchived !== undefined) {
            query += ` AND m."isArchived" = $${paramIndex++}`;
            params.push(isArchived === 'true');
        }

        query += ` ORDER BY m."isPinned" DESC, m."updatedAt" DESC`;

        const result = await pool.query(query, params);

        const memos = result.rows.map(row => {
            const {
                user_id, user_email, user_name,
                category_id, category_name, category_color, category_created_at, category_updated_at,
                ...memoData
            } = row;
            return {
                ...memoData,
                user: user_id ? {
                    id: user_id,
                    email: user_email,
                    name: user_name
                } : null,
                category: category_id ? {
                    id: category_id,
                    name: category_name,
                    color: category_color,
                    createdAt: category_created_at,
                    updatedAt: category_updated_at
                } : null
            };
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

        const result = await pool.query(`
            SELECT m.*, 
                   u.id as user_id, u.email as user_email, u.name as user_name,
                   c.id as category_id, c.name as category_name, c.color as category_color, c."createdAt" as category_created_at, c."updatedAt" as category_updated_at
            FROM "Memo" m
            LEFT JOIN "User" u ON m."userId" = u.id
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE m.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Memo not found' });
        }

        const row = result.rows[0];
        const {
            user_id, user_email, user_name,
            category_id, category_name, category_color, category_created_at, category_updated_at,
            ...memoData
        } = row;

        const memo = {
            ...memoData,
            user: user_id ? {
                id: user_id,
                email: user_email,
                name: user_name
            } : null,
            category: category_id ? {
                id: category_id,
                name: category_name,
                color: category_color,
                createdAt: category_created_at,
                updatedAt: category_updated_at
            } : null
        };

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

        const id = randomUUID();
        const now = new Date();

        // Use CTE to insert and then select with joins
        const result = await pool.query(`
            WITH inserted AS (
                INSERT INTO "Memo" (id, title, content, "userId", "categoryId", "isPinned", "isArchived", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
                RETURNING *
            )
            SELECT m.*, 
                   u.id as user_id, u.email as user_email, u.name as user_name,
                   c.id as category_id, c.name as category_name, c.color as category_color, c."createdAt" as category_created_at, c."updatedAt" as category_updated_at
            FROM inserted m
            LEFT JOIN "User" u ON m."userId" = u.id
            LEFT JOIN "Category" c ON m."categoryId" = c.id
        `, [id, title, content, userId, categoryId || null, isPinned || false, false, now]);

        const row = result.rows[0];
        const {
            user_id, user_email, user_name,
            category_id, category_name, category_color, category_created_at, category_updated_at,
            ...memoData
        } = row;

        const memo = {
            ...memoData,
            user: user_id ? {
                id: user_id,
                email: user_email,
                name: user_name
            } : null,
            category: category_id ? {
                id: category_id,
                name: category_name,
                color: category_color,
                createdAt: category_created_at,
                updatedAt: category_updated_at
            } : null
        };

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

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (content !== undefined) {
            updates.push(`content = $${paramIndex++}`);
            values.push(content);
        }
        if (categoryId !== undefined) {
            updates.push(`"categoryId" = $${paramIndex++}`);
            values.push(categoryId);
        }
        if (isPinned !== undefined) {
            updates.push(`"isPinned" = $${paramIndex++}`);
            values.push(isPinned);
        }
        if (isArchived !== undefined) {
            updates.push(`"isArchived" = $${paramIndex++}`);
            values.push(isArchived);
        }

        let result;
        if (updates.length > 0) {
            updates.push(`"updatedAt" = $${paramIndex++}`);
            values.push(new Date());

            // CTE update + select
            result = await pool.query(`
                WITH updated AS (
                    UPDATE "Memo" 
                    SET ${updates.join(', ')} 
                    WHERE id = $${paramIndex} 
                    RETURNING *
                )
                SELECT m.*, 
                    u.id as user_id, u.email as user_email, u.name as user_name,
                    c.id as category_id, c.name as category_name, c.color as category_color, c."createdAt" as category_created_at, c."updatedAt" as category_updated_at
                FROM updated m
                LEFT JOIN "User" u ON m."userId" = u.id
                LEFT JOIN "Category" c ON m."categoryId" = c.id
            `, [...values, id]);
        } else {
            // Just fetch if no updates (but update updatedAt?)
            // As with User, let's force update updatedAt or just fetch.
            // Let's assume for consistency we update updatedAt.
            result = await pool.query(`
                WITH updated AS (
                    UPDATE "Memo" 
                    SET "updatedAt" = $1 
                    WHERE id = $2 
                    RETURNING *
                )
                SELECT m.*, 
                    u.id as user_id, u.email as user_email, u.name as user_name,
                    c.id as category_id, c.name as category_name, c.color as category_color, c."createdAt" as category_created_at, c."updatedAt" as category_updated_at
                FROM updated m
                LEFT JOIN "User" u ON m."userId" = u.id
                LEFT JOIN "Category" c ON m."categoryId" = c.id
            `, [new Date(), id]);
        }

        if (result.rows.length === 0) {
            // memo not found implies 404 potentially, but here handled as success: false via catch or just null data?
            // Original didn't explicitly check 404 in updateMemo, but Prisma throws.
            // Let's match behavior: if 404, usually error or failure.
            // But strict REST, if ID doesn't exist, we should return 404.
            // The frontend might expect it.
            // For now, let's return success: false if not found.
            // Actually, if we return success: true, data: undefined, it might break.
            return res.status(404).json({ success: false, error: 'Memo not found' });
        }

        const row = result.rows[0];
        const {
            user_id, user_email, user_name,
            category_id, category_name, category_color, category_created_at, category_updated_at,
            ...memoData
        } = row;

        const memo = {
            ...memoData,
            user: user_id ? {
                id: user_id,
                email: user_email,
                name: user_name
            } : null,
            category: category_id ? {
                id: category_id,
                name: category_name,
                color: category_color,
                createdAt: category_created_at,
                updatedAt: category_updated_at
            } : null
        };

        res.json({ success: true, data: memo });
    } catch (error) {
        console.error('Error updating memo:', error);
        res.status(500).json({ success: false, error: 'Failed to update memo' });
    }
};

export const deleteMemo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM "Memo" WHERE id = $1', [id]);

        res.json({ success: true, message: 'Memo deleted successfully' });
    } catch (error) {
        console.error('Error deleting memo:', error);
        res.status(500).json({ success: false, error: 'Failed to delete memo' });
    }
};
