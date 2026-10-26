import mysql, { type PoolConnection, type RowDataPacket } from 'mysql2/promise';

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

function connectionOptions() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing database environment variables: ${missing.join(', ')}`);
  }

  const port = Number(process.env.DB_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be a valid TCP port.');
  }

  return {
    host: process.env.DB_HOST,
    port,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
    queueLimit: 0,
    enableKeepAlive: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    charset: 'utf8mb4',
  };
}

const globalPool = globalThis as typeof globalThis & { votingDbPool?: mysql.Pool };

export function getDb() {
  if (!globalPool.votingDbPool) {
    globalPool.votingDbPool = mysql.createPool(connectionOptions());
  }
  return globalPool.votingDbPool;
}

export async function pingDb() {
  const [rows] = await getDb().query<RowDataPacket[]>('SELECT 1 AS healthy');
  return rows[0]?.healthy === 1;
}

export async function withTransaction<T>(callback: (connection: PoolConnection) => Promise<T>) {
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
