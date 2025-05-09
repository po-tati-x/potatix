import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkMigrationsDir() {
  const migrationsDir = './migrations';
  const metaDir = path.join(migrationsDir, 'meta');
  
  // Check if migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    console.log('Creating migrations directory...');
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Check if meta directory exists
  if (!fs.existsSync(metaDir)) {
    console.log('Creating meta directory...');
    fs.mkdirSync(metaDir, { recursive: true });
  }
  
  // Check if _journal.json exists
  const journalPath = path.join(metaDir, '_journal.json');
  if (!fs.existsSync(journalPath)) {
    console.log('Creating initial _journal.json file...');
    fs.writeFileSync(journalPath, JSON.stringify({
      version: "5",
      dialect: "pg",
      entries: []
    }, null, 2));
  }
}

async function main() {
  await checkMigrationsDir();
  
  console.log('Setting up database connection...');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  
  // Test the connection first
  try {
    const client = await pool.connect();
    console.log('Database connection successful!');
    client.release();
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
  
  const db = drizzle(pool);
  
  try {
    console.log('Running migrations...');
    
    // This will apply all pending migrations
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('Migrations complete! Database is ready.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the pool to end the process
    await pool.end();
  }
}

// Run the migration function
main().catch(err => {
  console.error('Unhandled error in migration process:', err);
  process.exit(1);
}); 