import * as XLSX from "xlsx";
import type { Product } from "./types";

function productsToRows(products: Product[]) {
  return products.map((product) => ({
    Дугаар: product.product_no ?? "",
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
}

export function buildProductsWorkbook(products: Product[]) {
  const worksheet = XLSX.utils.json_to_sheet(productsToRows(products));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Бараа");
  return workbook;
}

export function workbookToBuffer(workbook: XLSX.WorkBook): Buffer {
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    link.target = "_blank";
    link.rel = "noopener";
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadProductsExcel(products: Product[]) {
  if (products.length === 0) return;

  const workbook = buildProductsWorkbook(products);
  const date = new Date().toISOString().slice(0, 10);
  const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, `baraa-${date}.xlsx`);
}
