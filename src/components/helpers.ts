import type { ChildrenPage, FlatRow, NodeDto } from "@/types/taxonomy";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";

type CachedPages = InfiniteData<ChildrenPage, number>;

export default function buildFlatTree(
  root: NodeDto,
  expanded: Set<string>,
  queryClient: QueryClient,
): FlatRow[] {
  const rows: FlatRow[] = [];

  const walk = (node: NodeDto, depth: number) => {
    rows.push({ type: "node", node, depth });

    if (!expanded.has(node.path)) return;

    const data = queryClient.getQueryData<CachedPages>([
      "tree",
      "children",
      node.path,
    ]);
    const childDepth = depth + 1;

    if (!data) {
      rows.push({ type: "loading", parentPath: node.path, depth: childDepth });
      return;
    }

    for (const child of data.pages.flatMap(({ children }) => children)) {
      walk(child, childDepth);
    }

    if (data.pages.at(-1)?.hasMore) {
      rows.push({
        type: "load-more",
        parentPath: node.path,
        depth: childDepth,
      });
    }
  };

  walk(root, 0);

  return rows;
}
