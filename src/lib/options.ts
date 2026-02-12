import { queryOptions } from "@tanstack/react-query";
import { client } from "./client";
import { NodeDto } from "@/types/taxonomy";

export const rootOptions = () =>
  queryOptions({
    queryKey: ["tree", "root"],
    queryFn: () => client.get<NodeDto>("/api/tree/root"),
  });

export const childrenOptions = (path: string) =>
  queryOptions({
    queryKey: ["tree", "children", path],
    queryFn: () =>
      client.get<NodeDto[]>(
        `/api/tree/children?path=${encodeURIComponent(path)}`,
      ),
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
