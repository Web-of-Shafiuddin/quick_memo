import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrate = async () => {
    console.log('Script started');
    const client = await pool.connect();

    try {
        console.log('🔄 Starting database migration...');

        // Create migrations table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get executed migrations
        const { rows: executedMigrations } = await client.query('SELECT name FROM migrations');
        const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

        // Get migration files
        const migrationsDir = path.join(process.cwd(), 'src/db/migrations');
        console.log('Reading migrations from:', migrationsDir);

        if (!fs.existsSync(migrationsDir)) {
            throw new Error(`Migrations directory not found at ${migrationsDir}`);
        }

        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            if (!executedMigrationNames.has(file)) {
                console.log(`▶️ Running migration: ${file}`);

                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf-8');

                try {
                    await client.query('BEGIN');
                    await client.query(sql);
                    await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                    await client.query('COMMIT');
                    console.log(`✅ Migration ${file} completed successfully`);
                } catch (error) {
                    await client.query('ROLLBACK');
                    console.error(`❌ Migration ${file} failed:`, error);
                    throw error;
                }
            } else {
                console.log(`⏩ Skipping already executed migration: ${file}`);
            }
        }

        console.log('✨ All migrations finished successfully');
    } catch (error) {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

migrate();
