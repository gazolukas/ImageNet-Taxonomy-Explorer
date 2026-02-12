import { useQuery } from "@tanstack/react-query";
import {
  rootOptions,
  childrenOptions,
  detailsOptions,
  searchOptions,
} from "./options";

export function useRoot() {
  return useQuery(rootOptions());
}

export function useChildren(path: string | null) {
  return useQuery({
    ...childrenOptions(path ?? ""),
    enabled: path !== null,
  });
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
