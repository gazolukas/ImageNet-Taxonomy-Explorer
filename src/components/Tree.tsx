"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loading, Alert, Text, Box, Stack } from "@kiwicom/orbit-components";
import { useFlatTree, useRoot } from "@/lib/hooks";
import { useTree } from "@/lib/store";
import { ROW_HEIGHT_ESTIMATE } from "@/lib/constants";
import { Node } from "./Node";
import { LoadingMore } from "./LoadingMore";

export const Tree = () => {
  const { data: root, error, isLoading } = useRoot();
  const { scrollToPath, clearScrollTo } = useTree();
  const scrollRef = useRef<HTMLDivElement>(null);
  const flatRows = useFlatTree(root);

  const virtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 15,
  });

  useEffect(() => {
    if (!scrollToPath) return;

    const index = flatRows.findIndex(
      (row) => row.type === "node" && row.node.path === scrollToPath,
    );

    if (index >= 0) {
      virtualizer.scrollToIndex(index, { align: "center" });
      clearScrollTo();
    }
  }, [scrollToPath, flatRows, virtualizer, clearScrollTo]);

  if (error)
    return (
      <Alert type="critical" icon>
        {error.message}
      </Alert>
    );

  if (isLoading) {
    return <Loading type="searchLoader" />;
  }

  if (!root) {
    return <Text type="secondary">No taxonomy data found.</Text>;
  }

  return (
    <Box ref={scrollRef} height="70vh" overflow="auto" position="relative">
      <Box height={`${virtualizer.getTotalSize()}px`}>
        {virtualizer.getVirtualItems().map((item) => {
          const row = flatRows[item.index];

          return (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${item.start}px)`,
              }}
            >
              {row.type === "node" && (
                <Node node={row.node} depth={row.depth} />
              )}
              {row.type === "loading" && (
                <Stack justify="center">
                  <Loading type="inlineLoader" />
                </Stack>
              )}
              {row.type === "load-more" && (
                <LoadingMore path={row.parentPath} />
              )}
            </div>
          );
        })}
      </Box>
    </Box>
  );
};
