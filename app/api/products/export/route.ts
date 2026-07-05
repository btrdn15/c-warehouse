import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/db";
import { buildProductsWorkbook, workbookToBuffer } from "@/lib/exportProducts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body as { ids: number[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Бараа сонгоно уу" },
        { status: 400 }
      );
    }

    const validIds = new Set(
      ids.filter((id) => Number.isInteger(id) && id > 0)
    );
    if (validIds.size === 0) {
      return NextResponse.json({ error: "Буруу ID" }, { status: 400 });
    }

    const allProducts = await getAllProducts();
    const products = allProducts.filter((product) => validIds.has(product.id));

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Сонгосон бараа олдсонгүй" },
        { status: 404 }
      );
    }

    const workbook = buildProductsWorkbook(products);
    const buffer = workbookToBuffer(workbook);
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="baraa-${date}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Excel татахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
