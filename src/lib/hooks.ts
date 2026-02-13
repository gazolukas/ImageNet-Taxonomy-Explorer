import { useQuery, useQueryClient } from "@tanstack/react-query";
import { rootOptions, detailsOptions, searchOptions } from "./api";
import { NodeDto } from "@/types/taxonomy";
import { useTree } from "./store";
import { useEffect, useMemo, useState } from "react";
import buildFlatTree from "@/components/helpers";

export function useRoot() {
  return useQuery(rootOptions());
}

export function useDetail(path: string | null) {
  return useQuery({
    ...detailsOptions(path ?? ""),
    enabled: path !== null,
  });
}

export function useSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    ...searchOptions(trimmed),
    enabled: trimmed.length > 0,
    placeholderData: (prev) => prev,
  });
}

export function useDebouncedValue<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useFlatTree(root: NodeDto | undefined) {
  const { expanded } = useTree();
  const queryClient = useQueryClient();
  const [cacheVersion, setCacheVersion] = useState(0);

  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      const queryKey = event?.query.queryKey;

      if (
        Array.isArray(queryKey) &&
        queryKey[0] === "tree" &&
        queryKey[1] === "children"
      ) {
        setCacheVersion((prev) => prev + 1);
      }
    });
  }, [queryClient]);

  return useMemo(() => {
    if (!root) return [];

    return buildFlatTree(root, expanded, queryClient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, expanded, queryClient, cacheVersion]);
}
