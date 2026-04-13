import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toSnakeCase } from "@/lib/apiMappers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const offers = await prisma.offer.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(offers.map(toSnakeCase));
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const offer = await prisma.offer.create({
      data: {
        userId: session.user.id,
        title: body.title,
        description: body.description,
        category: body.category,
        price: body.price,
        originalPrice: body.originalPrice || body.original_price,
        currency: body.currency || "EUR",
        billingType: body.billingType || body.billing_type || "one_time",
        status: body.status || "active",
        imageUrl: body.imageUrl || body.image_url,
        features: body.features || [],
      },
    });
    return NextResponse.json(toSnakeCase(offer), { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
