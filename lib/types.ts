export type ProductStatus =
  | "ачигдаагүй"
  | "ачигдсан"
  | "замд"
  | "буусан";

export interface Product {
  id: number;
  name: string;
  added_by: string;
  date: string;
  status: ProductStatus;
  received_by: string | null;
  created_at: string;
}

export const STATUS_OPTIONS: ProductStatus[] = [
  "ачигдаагүй",
  "ачигдсан",
  "замд",
  "буусан",
];

export const STATUS_COLORS: Record<ProductStatus, string> = {
  ачигдаагүй: "bg-gray-100 text-gray-800 border-gray-300",
  ачигдсан: "bg-blue-100 text-blue-800 border-blue-300",
  замд: "bg-amber-100 text-amber-900 border-amber-300",
  буусан: "bg-green-100 text-green-800 border-green-300",
};
