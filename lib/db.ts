import { createClient, type Client } from "@libsql/client";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Product, ProductStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "warehouse.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    added_by TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ачигдаагүй',
    received_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

let sqliteDb: Database.Database | null = null;
let tursoClient: Client | null = null;
let schemaReady = false;

function useTurso(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma("journal_mode = WAL");
    sqliteDb.exec(SCHEMA);

    const columns = sqliteDb
      .prepare("PRAGMA table_info(products)")
      .all() as { name: string }[];
    if (!columns.some((col) => col.name === "received_by")) {
      sqliteDb.exec("ALTER TABLE products ADD COLUMN received_by TEXT");
    }
  }
  return sqliteDb;
}

function getTurso(): Client {
  if (!tursoClient) {
    tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return tursoClient;
}

async function ensureSchema(): Promise<void> {
  if (schemaReady) return;

  if (useTurso()) {
    const client = getTurso();
    await client.execute(SCHEMA);
    const info = await client.execute("PRAGMA table_info(products)");
    const hasReceivedBy = info.rows.some(
      (row) => row.name === "received_by" || row[1] === "received_by"
    );
    if (!hasReceivedBy) {
      await client.execute(
        "ALTER TABLE products ADD COLUMN received_by TEXT"
      );
    }
  } else {
    getSqliteDb();
  }

  schemaReady = true;
}

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    added_by: String(row.added_by),
    date: String(row.date),
    status: row.status as ProductStatus,
    received_by: row.received_by ? String(row.received_by) : null,
    created_at: String(row.created_at),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  await ensureSchema();

  if (useTurso()) {
    const result = await getTurso().execute(
      "SELECT * FROM products ORDER BY created_at ASC"
    );
    return result.rows.map((row) => rowToProduct(row as Record<string, unknown>));
  }

  const rows = getSqliteDb()
    .prepare("SELECT * FROM products ORDER BY created_at ASC")
    .all() as Product[];
  return rows;
}

export async function createProduct(data: {
  name: string;
  added_by: string;
  date: string;
}): Promise<Product> {
  await ensureSchema();

  if (useTurso()) {
    const result = await getTurso().execute({
      sql: `INSERT INTO products (name, added_by, date, status)
            VALUES (?, ?, ?, 'ачигдаагүй')
            RETURNING *`,
      args: [data.name, data.added_by, data.date],
    });
    return rowToProduct(result.rows[0] as Record<string, unknown>);
  }

  const result = getSqliteDb()
    .prepare(
      "INSERT INTO products (name, added_by, date, status) VALUES (?, ?, ?, 'ачигдаагүй')"
    )
    .run(data.name, data.added_by, data.date);
  const product = getSqliteDb()
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(result.lastInsertRowid) as Product;
  return product;
}

export async function updateProductStatus(
  id: number,
  status: ProductStatus
): Promise<Product | null> {
  await ensureSchema();

  if (useTurso()) {
    const result = await getTurso().execute({
      sql: "UPDATE products SET status = ? WHERE id = ? RETURNING *",
      args: [status, id],
    });
    if (result.rows.length === 0) return null;
    return rowToProduct(result.rows[0] as Record<string, unknown>);
  }

  getSqliteDb()
    .prepare("UPDATE products SET status = ? WHERE id = ?")
    .run(status, id);
  const product = getSqliteDb()
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as Product | undefined;
  return product ?? null;
}

export async function updateBulkProductStatus(
  ids: number[],
  status: ProductStatus
): Promise<Product[]> {
  if (ids.length === 0) return [];
  await ensureSchema();

  if (useTurso()) {
    const placeholders = ids.map(() => "?").join(", ");
    await getTurso().execute({
      sql: `UPDATE products SET status = ? WHERE id IN (${placeholders})`,
      args: [status, ...ids],
    });
    const selectPlaceholders = ids.map(() => "?").join(", ");
    const result = await getTurso().execute({
      sql: `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`,
      args: ids,
    });
    return result.rows.map((row) =>
      rowToProduct(row as Record<string, unknown>)
    );
  }

  const placeholders = ids.map(() => "?").join(", ");
  getSqliteDb()
    .prepare(`UPDATE products SET status = ? WHERE id IN (${placeholders})`)
    .run(status, ...ids);
  const selectPlaceholders = ids.map(() => "?").join(", ");
  return getSqliteDb()
    .prepare(
      `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`
    )
    .all(...ids) as Product[];
}

export async function updateBulkProductReceivedBy(
  ids: number[],
  receivedBy: string
): Promise<Product[]> {
  if (ids.length === 0) return [];
  await ensureSchema();

  if (useTurso()) {
    const placeholders = ids.map(() => "?").join(", ");
    await getTurso().execute({
      sql: `UPDATE products SET received_by = ? WHERE id IN (${placeholders})`,
      args: [receivedBy, ...ids],
    });
    const selectPlaceholders = ids.map(() => "?").join(", ");
    const result = await getTurso().execute({
      sql: `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`,
      args: ids,
    });
    return result.rows.map((row) =>
      rowToProduct(row as Record<string, unknown>)
    );
  }

  const placeholders = ids.map(() => "?").join(", ");
  getSqliteDb()
    .prepare(
      `UPDATE products SET received_by = ? WHERE id IN (${placeholders})`
    )
    .run(receivedBy, ...ids);
  const selectPlaceholders = ids.map(() => "?").join(", ");
  return getSqliteDb()
    .prepare(
      `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`
    )
    .all(...ids) as Product[];
}
