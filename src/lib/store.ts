import { create } from "zustand";
import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import {
  childrenOptions,
  fetchPosition,
  fetchChildrenPage,
  getAncestorPairs,
  prefetchChildrenPages,
} from "./api";
import type { ChildrenPage } from "@/types/taxonomy";
import { CHILDREN_PAGE_SIZE } from "./constants";

type TreeState = {
  selectedPath: string | null;
  expanded: Set<string>;
  scrollToPath: string | null;

  selectNode: (path: string) => void;
  toggleNode: (path: string, queryClient: QueryClient) => void;
  navigateTo: (path: string, queryClient: QueryClient) => Promise<void>;
  loadMoreChildren: (
    parentPath: string,
    queryClient: QueryClient,
  ) => Promise<void>;
  clearScrollTo: () => void;
};

export const useTree = create<TreeState>((set, get) => ({
  selectedPath: null,
  expanded: new Set<string>(),
  scrollToPath: null,

  selectNode: (path) => set({ selectedPath: path }),
  clearScrollTo: () => set({ scrollToPath: null }),
  toggleNode: (path, queryClient) => {
    const isExpanding = !get().expanded.has(path);

    set((state) => {
      const next = new Set(state.expanded);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return { expanded: next };
    });

    if (isExpanding) {
      void queryClient.ensureInfiniteQueryData(childrenOptions(path));
    }
  },

  loadMoreChildren: async (parentPath, queryClient) => {
    const key = ["tree", "children", parentPath];
    const currentData =
      queryClient.getQueryData<InfiniteData<ChildrenPage, number>>(key);

    if (!currentData) return;

    const lastParam = currentData.pageParams[currentData.pageParams.length - 1];
    const lastPage = currentData.pages[currentData.pages.length - 1];

    if (!lastPage.hasMore) return;

    const nextOffset = lastParam + CHILDREN_PAGE_SIZE;
    const nextPage = await fetchChildrenPage(parentPath, nextOffset);

    queryClient.setQueryData<InfiniteData<ChildrenPage, number>>(key, {
      pages: [...currentData.pages, nextPage],
      pageParams: [...currentData.pageParams, nextOffset],
    });
  },

  navigateTo: async (path, queryClient) => {
    const pairs = getAncestorPairs(path);

    await Promise.all(
      pairs.map(async ({ parent, child }) => {
        const { pageIndex } = await fetchPosition(parent, child);
        await prefetchChildrenPages(queryClient, parent, pageIndex);
      }),
    );

    set({
      expanded: new Set(pairs.map(({ parent }) => parent)),
      selectedPath: path,
      scrollToPath: path,
    });
  },
}));
