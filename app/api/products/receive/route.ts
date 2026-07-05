import { NextResponse } from "next/server";
import { updateBulkProductReceivedBy } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids, received_by, received_date } = body as {
      ids: number[];
      received_by: string;
      received_date: string;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Бараа сонгоно уу" },
        { status: 400 }
      );
    }

    if (!received_by?.trim()) {
      return NextResponse.json(
        { error: "Хүлээн авагчийн нэр оруулна уу" },
        { status: 400 }
      );
    }

    if (!received_date?.trim()) {
      return NextResponse.json(
        { error: "Хүлээн авсан огноо оруулна уу" },
        { status: 400 }
      );
    }

    const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) {
      return NextResponse.json({ error: "Буруу ID" }, { status: 400 });
    }

    const products = await updateBulkProductReceivedBy(
      validIds,
      received_by.trim(),
      received_date.trim()
    );
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Хүлээн авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
