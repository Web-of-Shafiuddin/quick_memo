import pool from '../config/database.js';

const createTables = async () => {
    try {
        console.log('Creating tables...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS "User" (
                "id" TEXT PRIMARY KEY,
                "email" TEXT UNIQUE NOT NULL,
                "name" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS "Category" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT UNIQUE NOT NULL,
                "color" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS "Memo" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "isPinned" BOOLEAN NOT NULL DEFAULT false,
                "isArchived" BOOLEAN NOT NULL DEFAULT false,
                "userId" TEXT NOT NULL,
                "categoryId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
            );
        `);

        // Add indices
        await pool.query(`CREATE INDEX IF NOT EXISTS "Memo_userId_idx" ON "Memo"("userId");`);
        await pool.query(`CREATE INDEX IF NOT EXISTS "Memo_categoryId_idx" ON "Memo"("categoryId");`);

        console.log('Tables created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createTables();
