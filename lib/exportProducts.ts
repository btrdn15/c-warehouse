import * as XLSX from "xlsx";
import type { Product } from "./types";

export function downloadProductsExcel(products: Product[]) {
  if (products.length === 0) return;

  const rows = products.map((product) => ({
    Дугаар: product.product_no,
    "Барааны нэр": product.name,
    "Оруулсан хүн": product.added_by,
    Огноо: product.date,
    "Үнэ (анх авсан)": product.price ?? "",
    "Каргоны үнэ": product.cargo_price ?? "",
    Төлөв: product.status,
    "Хүлээн авсан": product.received_by ?? "",
    "Хүлээн авсан огноо": product.received_date ?? "",
    "Монголд буусан": product.arrived_date ?? "",
    "Зарсан хүн": product.sold_by ?? "",
    "Хэдээр зарсан": product.sold_price ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Бараа");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `baraa-${date}.xlsx`);
}
