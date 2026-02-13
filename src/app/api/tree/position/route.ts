import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { CHILDREN_PAGE_SIZE } from "@/lib/constants";

const querySchema = z.object({
  parent: z.string().min(1),
  child: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    parent: params.get("parent") ?? "",
    child: params.get("child") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params." },
      { status: 400 },
    );
  }

  const { parent: parentPath, child: childPath } = parsed.data;

  const [parent, child] = await Promise.all([
    prisma.taxonomy.findUnique({ where: { path: parentPath } }),
    prisma.taxonomy.findUnique({ where: { path: childPath } }),
  ]);

  if (!parent) {
    return NextResponse.json(
      { error: "Parent node not found." },
      { status: 404 },
    );
  }

  if (!child) {
    return NextResponse.json(
      { error: "Child node not found." },
      { status: 404 },
    );
  }

  const index = await prisma.taxonomy.count({
    where: {
      depth: parent.depth + 1,
      path: { startsWith: `${parent.path} > ` },
      OR: [
        { size: { gt: child.size } },
        { size: child.size, name: { lt: child.name } },
      ],
    },
  });

  const pageIndex = Math.floor(index / CHILDREN_PAGE_SIZE);

  return NextResponse.json({ index, pageIndex });
}
