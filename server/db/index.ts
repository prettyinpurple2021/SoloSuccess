import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("⚠️  WARNING: DATABASE_URL is not defined. The backend will crash if you try to query the DB.");
}

// Connection pool configured for production readiness
const pool = new Pool({
    connectionString: connectionString,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased to 10s for slower connections
    ssl: {
        rejectUnauthorized: false // Required for Neon/Render connections
    }
});

// The pool will emit an error on behalf of any idle client it contains
// if a backend error or network partition happens
pool.on('error', (err, _client) => {
    console.error('Unexpected error on idle client', err);
    // process.exit(-1); // Do not exit, let the pool handle reconnection for new clients
});

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Connected to Neon Database");
        client.release();
    } catch (err) {
        console.error("❌ Failed to connect to Neon Database:", err);
    }
};

connectDB();

export const db = drizzle(pool, { schema });
