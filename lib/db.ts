import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Product, ProductStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "warehouse.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        added_by TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ачигдаагүй',
        received_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const columns = db
      .prepare("PRAGMA table_info(products)")
      .all() as { name: string }[];
    if (!columns.some((col) => col.name === "received_by")) {
      db.exec("ALTER TABLE products ADD COLUMN received_by TEXT");
    }
  }
  return db;
}

export function getAllProducts(): Product[] {
  const rows = getDb()
    .prepare("SELECT * FROM products ORDER BY created_at ASC")
    .all() as Product[];
  return rows;
}

export function createProduct(data: {
  name: string;
  added_by: string;
  date: string;
}): Product {
  const result = getDb()
    .prepare(
      "INSERT INTO products (name, added_by, date, status) VALUES (?, ?, ?, 'ачигдаагүй')"
    )
    .run(data.name, data.added_by, data.date);
  const product = getDb()
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(result.lastInsertRowid) as Product;
  return product;
}

export function updateProductStatus(
  id: number,
  status: ProductStatus
): Product | null {
  getDb()
    .prepare("UPDATE products SET status = ? WHERE id = ?")
    .run(status, id);
  const product = getDb()
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as Product | undefined;
  return product ?? null;
}

export function updateBulkProductStatus(
  ids: number[],
  status: ProductStatus
): Product[] {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => "?").join(", ");
  getDb()
    .prepare(`UPDATE products SET status = ? WHERE id IN (${placeholders})`)
    .run(status, ...ids);

  const selectPlaceholders = ids.map(() => "?").join(", ");
  const products = getDb()
    .prepare(
      `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`
    )
    .all(...ids) as Product[];

  return products;
}

export function updateBulkProductReceivedBy(
  ids: number[],
  receivedBy: string
): Product[] {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => "?").join(", ");
  getDb()
    .prepare(
      `UPDATE products SET received_by = ? WHERE id IN (${placeholders})`
    )
    .run(receivedBy, ...ids);

  const selectPlaceholders = ids.map(() => "?").join(", ");
  const products = getDb()
    .prepare(
      `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`
    )
    .all(...ids) as Product[];

  return products;
}
