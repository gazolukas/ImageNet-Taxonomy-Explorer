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

  const parent = await prisma.taxonomy.findUnique({
    where: { path: parsed.data.path },
  });

  if (!parent) {
    return NextResponse.json({ error: "Parent node not found." }, { status: 404 });
  }

  const children = await prisma.taxonomy.findMany({
    where: {
      depth: parent.depth + 1,
      path: { startsWith: `${parent.path} > ` },
    },
    orderBy: [{ size: "desc" }, { name: "asc" }],
  });

  const childrenWithCount = await Promise.all(
    children.map(async (child) => {
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

  return NextResponse.json(childrenWithCount);
}
