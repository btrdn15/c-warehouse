import { NextResponse } from "next/server";
import { createProduct, getAllProducts } from "@/lib/db";

export async function GET() {
  const products = getAllProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, added_by, date } = body;

    if (!name?.trim() || !added_by?.trim() || !date?.trim()) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү" },
        { status: 400 }
      );
    }

    const product = createProduct({
      name: name.trim(),
      added_by: added_by.trim(),
      date: date.trim(),
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Бараа нэмэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
