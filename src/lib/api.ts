import {
  queryOptions,
  infiniteQueryOptions,
  type QueryClient,
} from "@tanstack/react-query";
import { client } from "./client";
import type { NodeDto, ChildrenPage } from "@/types/taxonomy";
import { CHILDREN_PAGE_SIZE } from "./constants";

export const rootOptions = () =>
  queryOptions({
    queryKey: ["tree", "root"],
    queryFn: () => client.get<NodeDto>("/api/tree/root"),
  });

export const childrenOptions = (path: string) =>
  infiniteQueryOptions({
    queryKey: ["tree", "children", path],
    queryFn: ({ pageParam }) =>
      client.get<ChildrenPage>(
        `/api/tree/children?path=${encodeURIComponent(path)}&limit=${CHILDREN_PAGE_SIZE}&offset=${pageParam}`,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + CHILDREN_PAGE_SIZE : undefined,
  });

export const detailsOptions = (path: string) =>
  queryOptions({
    queryKey: ["tree", "detail", path],
    queryFn: () =>
      client.get<NodeDto>(`/api/tree/node?path=${encodeURIComponent(path)}`),
  });

export const searchOptions = (query: string) =>
  queryOptions({
    queryKey: ["search", query],
    queryFn: () =>
      client.get<NodeDto[]>(`/api/search?q=${encodeURIComponent(query)}`),
  });

export const fetchPosition = (parentPath: string, childPath: string) =>
  client.get<{ index: number; pageIndex: number }>(
    `/api/tree/position?parent=${encodeURIComponent(parentPath)}&child=${encodeURIComponent(childPath)}`,
  );

export const fetchChildrenPage = (parentPath: string, offset: number) =>
  client.get<ChildrenPage>(
    `/api/tree/children?path=${encodeURIComponent(parentPath)}&limit=${CHILDREN_PAGE_SIZE}&offset=${offset}`,
  );

export function getAncestorPairs(path: string) {
  const segments = path.split(" > ");
  const pairs: { parent: string; child: string }[] = [];
  let current = "";

  for (let i = 0; i < segments.length - 1; i++) {
    current = current ? `${current} > ${segments[i]}` : segments[i];
    pairs.push({ parent: current, child: `${current} > ${segments[i + 1]}` });
  }

  return pairs;
}

export async function prefetchChildrenPages(
  queryClient: QueryClient,
  parentPath: string,
  pageIndex: number,
) {
  if (pageIndex === 0) {
    await queryClient.ensureInfiniteQueryData(childrenOptions(parentPath));
    return;
  }

  const offsets = Array.from(
    { length: pageIndex + 1 },
    (_, i) => i * CHILDREN_PAGE_SIZE,
  );
  const pages = await Promise.all(
    offsets.map((offset) => fetchChildrenPage(parentPath, offset)),
  );

  queryClient.setQueryData(["tree", "children", parentPath], {
    pages,
    pageParams: offsets,
  });
}
