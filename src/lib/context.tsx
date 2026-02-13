"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import {
  childrenOptions,
  fetchPosition,
  fetchChildrenPage,
  getAncestorPairs,
  prefetchChildrenPages,
} from "./api";
import type { ChildrenPage } from "@/types/taxonomy";
import { CHILDREN_PAGE_SIZE } from "./constants";

type Context = {
  selectedPath: string | null;
  expanded: Set<string>;
  scrollToPath: string | null;
  selectNode: (path: string) => void;
  toggleNode: (path: string) => void;
  navigateTo: (path: string) => Promise<void>;
  loadMoreChildren: (parentPath: string) => Promise<void>;
  clearScrollTo: () => void;
};

export const Context = createContext<Context | null>(null);

type ProviderProps = {
  children: React.ReactNode;
};

export const Provider = ({ children }: ProviderProps) => {
  const queryClient = useQueryClient();

  const [selectedPath, selectNode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [scrollToPath, setScrollToPath] = useState<string | null>(null);

  const clearScrollTo = useCallback(() => setScrollToPath(null), []);

  const toggleNode = useCallback(
    (path: string) => {
      let isExpanding = false;

      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
          isExpanding = true;
        }
        return next;
      });

      if (isExpanding) {
        void queryClient.ensureInfiniteQueryData(childrenOptions(path));
      }
    },
    [queryClient],
  );

  const loadMoreChildren = useCallback(
    async (parentPath: string) => {
      const key = ["tree", "children", parentPath];
      const currentData =
        queryClient.getQueryData<InfiniteData<ChildrenPage, number>>(key);

      if (!currentData) return;

      const lastParam =
        currentData.pageParams[currentData.pageParams.length - 1];
      const lastPage = currentData.pages[currentData.pages.length - 1];

      if (!lastPage.hasMore) return;

      const nextOffset = lastParam + CHILDREN_PAGE_SIZE;
      const nextPage = await fetchChildrenPage(parentPath, nextOffset);

      queryClient.setQueryData<InfiniteData<ChildrenPage, number>>(key, {
        pages: [...currentData.pages, nextPage],
        pageParams: [...currentData.pageParams, nextOffset],
      });
    },
    [queryClient],
  );

  const navigateTo = useCallback(
    async (path: string) => {
      const pairs = getAncestorPairs(path);

      await Promise.all(
        pairs.map(async ({ parent, child }) => {
          const { pageIndex } = await fetchPosition(parent, child);
          await prefetchChildrenPages(queryClient, parent, pageIndex);
        }),
      );

      setExpanded(new Set(pairs.map(({ parent }) => parent)));
      selectNode(path);
      setScrollToPath(path);
    },
    [queryClient],
  );

  return (
    <Context.Provider
      value={{
        selectedPath,
        expanded,
        scrollToPath,
        selectNode,
        toggleNode,
        navigateTo,
        loadMoreChildren,
        clearScrollTo,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export function useTree() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useTree must be used within <Provider>");
  }

  return context;
}
