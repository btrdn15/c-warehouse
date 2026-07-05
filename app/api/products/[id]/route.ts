import { NextResponse } from "next/server";
import { updateProductStatus } from "@/lib/db";
import { STATUS_OPTIONS, type ProductStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Буруу ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, arrived_date } = body as {
      status: ProductStatus;
      arrived_date?: string;
    };

    if (!STATUS_OPTIONS.includes(status)) {
      return NextResponse.json({ error: "Буруу төлөв" }, { status: 400 });
    }

    if (status === "буусан" && !arrived_date?.trim()) {
      return NextResponse.json(
        { error: "Монголд буусан огноо оруулна уу" },
        { status: 400 }
      );
    }

    const product = await updateProductStatus(
      productId,
      status,
      status === "буусан" ? arrived_date?.trim() : null
    );
    if (!product) {
      return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "Төлөв шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
