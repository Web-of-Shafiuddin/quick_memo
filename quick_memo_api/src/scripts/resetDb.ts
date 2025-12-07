import pool from '../config/database.js';

const reset = async () => {
    try {
        console.log('🗑️ Cleaning database...');
        await pool.query('DROP TABLE IF EXISTS "Memo" CASCADE');
        await pool.query('DROP TABLE IF EXISTS "Category" CASCADE');
        await pool.query('DROP TABLE IF EXISTS "User" CASCADE');
        await pool.query('DROP TABLE IF EXISTS "migrations" CASCADE');
        console.log('✅ Database cleaned successfully');
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

reset();
