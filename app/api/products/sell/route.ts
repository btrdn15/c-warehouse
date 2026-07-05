import { NextResponse } from "next/server";
import { updateBulkProductSold } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids, sold_by, sold_price } = body as {
      ids: number[];
      sold_by: string;
      sold_price: string;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Бараа сонгоно уу" },
        { status: 400 }
      );
    }

    if (!sold_by?.trim()) {
      return NextResponse.json(
        { error: "Зарсан хүний нэр оруулна уу" },
        { status: 400 }
      );
    }

    if (!sold_price?.trim()) {
      return NextResponse.json(
        { error: "Зарсан үнэ оруулна уу" },
        { status: 400 }
      );
    }

    const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) {
      return NextResponse.json({ error: "Буруу ID" }, { status: 400 });
    }

    const products = await updateBulkProductSold(
      validIds,
      sold_by.trim(),
      sold_price.trim()
    );
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Зарах мэдээлэл хадгалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
