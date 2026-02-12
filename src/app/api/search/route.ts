import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(100).default(5),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? "",
    limit: request.nextUrl.searchParams.get("limit") ?? 5,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params." },
      { status: 400 },
    );
  }

  const { q, limit } = parsed.data;

  const results = await prisma.taxonomy.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { path: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ depth: "asc" }, { size: "desc" }],
    take: limit,
  });

  return NextResponse.json(results);
}
