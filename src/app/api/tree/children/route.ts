import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { CHILDREN_PAGE_SIZE } from "@/lib/constants";

const querySchema = z.object({
  path: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(200).default(CHILDREN_PAGE_SIZE),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    path: params.get("path") ?? "",
    limit: params.get("limit") ?? undefined,
    offset: params.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params." },
      { status: 400 },
    );
  }

  const { path, limit, offset } = parsed.data;

  const parent = await prisma.taxonomy.findUnique({
    where: { path },
  });

  if (!parent) {
    return NextResponse.json(
      { error: "Parent not found." },
      { status: 404 },
    );
  }

  const rows = await prisma.taxonomy.findMany({
    where: {
      depth: parent.depth + 1,
      path: { startsWith: `${parent.path} > ` },
    },
    orderBy: [{ size: "desc" }, { name: "asc" }],
    skip: offset,
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  const children = await Promise.all(
    page.map(async (child) => {
      const childCount = await prisma.taxonomy.count({
        where: {
          depth: child.depth + 1,
          path: { startsWith: `${child.path} > ` },
        },
      });
      return {
        ...child,
        childCount,
      };
    }),
  );

  return NextResponse.json({ children, hasMore });
}
