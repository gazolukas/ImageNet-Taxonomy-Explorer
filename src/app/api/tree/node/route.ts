import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  path: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    path: request.nextUrl.searchParams.get("path") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query params." }, { status: 400 });
  }

  const node = await prisma.taxonomy.findUnique({
    where: { path: parsed.data.path },
  });

  if (!node) {
    return NextResponse.json({ error: "Node not found." }, { status: 404 });
  }

  const childCount = await prisma.taxonomy.count({
    where: {
      depth: node.depth + 1,
      path: { startsWith: `${node.path} > ` },
    },
  });

  return NextResponse.json({
    ...node,
    childCount,
  });
}
