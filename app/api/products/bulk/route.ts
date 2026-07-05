import { NextResponse } from "next/server";
import { updateBulkProductStatus } from "@/lib/db";
import { STATUS_OPTIONS, type ProductStatus } from "@/lib/types";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids, status } = body as {
      ids: number[];
      status: ProductStatus;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Бараа сонгоно уу" },
        { status: 400 }
      );
    }

    if (!STATUS_OPTIONS.includes(status)) {
      return NextResponse.json({ error: "Буруу төлөв" }, { status: 400 });
    }

    const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) {
      return NextResponse.json({ error: "Буруу ID" }, { status: 400 });
    }

    const products = updateBulkProductStatus(validIds, status);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Төлөв шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
