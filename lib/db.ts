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
    product_no TEXT UNIQUE,
    name TEXT NOT NULL,
    added_by TEXT NOT NULL,
    date TEXT NOT NULL,
    price TEXT,
    cargo_price TEXT,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'ачигдаагүй',
    received_by TEXT,
    received_date TEXT,
    arrived_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

const MIGRATIONS = [
  { column: "received_by", sql: "ALTER TABLE products ADD COLUMN received_by TEXT" },
  { column: "price", sql: "ALTER TABLE products ADD COLUMN price TEXT" },
  { column: "image", sql: "ALTER TABLE products ADD COLUMN image TEXT" },
  { column: "arrived_date", sql: "ALTER TABLE products ADD COLUMN arrived_date TEXT" },
  { column: "cargo_price", sql: "ALTER TABLE products ADD COLUMN cargo_price TEXT" },
  { column: "received_date", sql: "ALTER TABLE products ADD COLUMN received_date TEXT" },
  { column: "product_no", sql: "ALTER TABLE products ADD COLUMN product_no TEXT" },
];

function randomProductNo(): string {
  const num = Math.floor(Math.random() * 9999) + 1;
  return String(num).padStart(4, "0");
}

function backfillProductNumbersSqlite(db: Database.Database): void {
  const missing = db
    .prepare("SELECT id FROM products WHERE product_no IS NULL ORDER BY id ASC")
    .all() as { id: number }[];
  if (missing.length === 0) return;

  const used = new Set(
    (
      db
        .prepare("SELECT product_no FROM products WHERE product_no IS NOT NULL")
        .all() as { product_no: string }[]
    ).map((row) => row.product_no)
  );

  const update = db.prepare("UPDATE products SET product_no = ? WHERE id = ?");
  for (const row of missing) {
    let productNo: string;
    do {
      productNo = randomProductNo();
    } while (used.has(productNo));
    used.add(productNo);
    update.run(productNo, row.id);
  }
}

function generateProductNoSqlite(db: Database.Database): string {
  const used = new Set(
    (
      db.prepare("SELECT product_no FROM products").all() as {
        product_no: string | null;
      }[]
    )
      .map((row) => row.product_no)
      .filter((value): value is string => Boolean(value))
  );

  for (let attempt = 0; attempt < 200; attempt++) {
    const productNo = randomProductNo();
    if (!used.has(productNo)) return productNo;
  }

  throw new Error("Барааны дугаар дууссан");
}

async function backfillProductNumbersTurso(client: Client): Promise<void> {
  const missing = await client.execute(
    "SELECT id FROM products WHERE product_no IS NULL ORDER BY id ASC"
  );
  if (missing.rows.length === 0) return;

  const existing = await client.execute(
    "SELECT product_no FROM products WHERE product_no IS NOT NULL"
  );
  const used = new Set(
    existing.rows.map((row) => String(row.product_no ?? row[0] ?? ""))
  );

  for (const row of missing.rows) {
    const id = Number(row.id ?? row[0]);
    let productNo: string;
    do {
      productNo = randomProductNo();
    } while (used.has(productNo));
    used.add(productNo);
    await client.execute({
      sql: "UPDATE products SET product_no = ? WHERE id = ?",
      args: [productNo, id],
    });
  }
}

async function generateProductNoTurso(client: Client): Promise<string> {
  const existing = await client.execute("SELECT product_no FROM products");
  const used = new Set(
    existing.rows
      .map((row) => row.product_no ?? row[0])
      .filter((value) => value != null)
      .map(String)
  );

  for (let attempt = 0; attempt < 200; attempt++) {
    const productNo = randomProductNo();
    if (!used.has(productNo)) return productNo;
  }

  throw new Error("Барааны дугаар дууссан");
}

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
    for (const migration of MIGRATIONS) {
      if (!columns.some((col) => col.name === migration.column)) {
        sqliteDb.exec(migration.sql);
      }
    }
    sqliteDb.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_no ON products(product_no)"
    );
    backfillProductNumbersSqlite(sqliteDb);
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
    const columnNames = new Set(
      info.rows.map((row) => String(row.name ?? row[1] ?? ""))
    );
    for (const migration of MIGRATIONS) {
      if (!columnNames.has(migration.column)) {
        await client.execute(migration.sql);
      }
    }
    await client.execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_no ON products(product_no)"
    );
    await backfillProductNumbersTurso(client);
  } else {
    getSqliteDb();
  }

  schemaReady = true;
}

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    product_no: String(row.product_no ?? ""),
    name: String(row.name),
    added_by: String(row.added_by),
    date: String(row.date),
    price: row.price ? String(row.price) : null,
    cargo_price: row.cargo_price ? String(row.cargo_price) : null,
    image: row.image ? String(row.image) : null,
    status: row.status as ProductStatus,
    received_by: row.received_by ? String(row.received_by) : null,
    received_date: row.received_date ? String(row.received_date) : null,
    arrived_date: row.arrived_date ? String(row.arrived_date) : null,
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
  price: string;
  cargo_price: string;
  image: string | null;
}): Promise<Product> {
  await ensureSchema();

  if (useTurso()) {
    const client = getTurso();
    const productNo = await generateProductNoTurso(client);
    const result = await client.execute({
      sql: `INSERT INTO products (product_no, name, added_by, date, price, cargo_price, image, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ачигдаагүй')
            RETURNING *`,
      args: [
        productNo,
        data.name,
        data.added_by,
        data.date,
        data.price,
        data.cargo_price,
        data.image,
      ],
    });
    return rowToProduct(result.rows[0] as Record<string, unknown>);
  }

  const db = getSqliteDb();
  const productNo = generateProductNoSqlite(db);
  const result = db
    .prepare(
      "INSERT INTO products (product_no, name, added_by, date, price, cargo_price, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'ачигдаагүй')"
    )
    .run(
      productNo,
      data.name,
      data.added_by,
      data.date,
      data.price,
      data.cargo_price,
      data.image
    );
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(result.lastInsertRowid) as Product;
  return product;
}

export async function updateProductStatus(
  id: number,
  status: ProductStatus,
  arrivedDate?: string | null
): Promise<Product | null> {
  await ensureSchema();

  if (useTurso()) {
    const result = await getTurso().execute({
      sql: "UPDATE products SET status = ?, arrived_date = ? WHERE id = ? RETURNING *",
      args: [status, arrivedDate ?? null, id],
    });
    if (result.rows.length === 0) return null;
    return rowToProduct(result.rows[0] as Record<string, unknown>);
  }

  getSqliteDb()
    .prepare("UPDATE products SET status = ?, arrived_date = ? WHERE id = ?")
    .run(status, arrivedDate ?? null, id);
  const product = getSqliteDb()
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as Product | undefined;
  return product ?? null;
}

export async function updateBulkProductStatus(
  ids: number[],
  status: ProductStatus,
  arrivedDate?: string | null
): Promise<Product[]> {
  if (ids.length === 0) return [];
  await ensureSchema();

  if (useTurso()) {
    const placeholders = ids.map(() => "?").join(", ");
    await getTurso().execute({
      sql: `UPDATE products SET status = ?, arrived_date = ? WHERE id IN (${placeholders})`,
      args: [status, arrivedDate ?? null, ...ids],
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
    .prepare(`UPDATE products SET status = ?, arrived_date = ? WHERE id IN (${placeholders})`)
    .run(status, arrivedDate ?? null, ...ids);
  const selectPlaceholders = ids.map(() => "?").join(", ");
  return getSqliteDb()
    .prepare(
      `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`
    )
    .all(...ids) as Product[];
}

export async function updateBulkProductReceivedBy(
  ids: number[],
  receivedBy: string,
  receivedDate: string
): Promise<Product[]> {
  if (ids.length === 0) return [];
  await ensureSchema();

  if (useTurso()) {
    const placeholders = ids.map(() => "?").join(", ");
    await getTurso().execute({
      sql: `UPDATE products SET received_by = ?, received_date = ? WHERE id IN (${placeholders})`,
      args: [receivedBy, receivedDate, ...ids],
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
      `UPDATE products SET received_by = ?, received_date = ? WHERE id IN (${placeholders})`
    )
    .run(receivedBy, receivedDate, ...ids);
  const selectPlaceholders = ids.map(() => "?").join(", ");
  return getSqliteDb()
    .prepare(
      `SELECT * FROM products WHERE id IN (${selectPlaceholders}) ORDER BY created_at ASC`
    )
    .all(...ids) as Product[];
}
