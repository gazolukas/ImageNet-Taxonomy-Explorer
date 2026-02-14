import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const root = await prisma.taxonomy.findFirst({
    where: { depth: 0 },
    orderBy: { path: "asc" },
  });

  if (!root) {
    return NextResponse.json({ error: "Root not found." }, { status: 404 });
  }

  const childCount = await prisma.taxonomy.count({
    where: { depth: 1, path: { startsWith: `${root.path} > ` } },
  });

  return NextResponse.json({
    ...root,
    childCount,
  });
}
