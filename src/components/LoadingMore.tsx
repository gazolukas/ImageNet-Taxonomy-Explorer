import { useQueryClient } from "@tanstack/react-query";
import { useTree } from "@/lib/store";
import { Loading, Stack } from "@kiwicom/orbit-components";
import { useEffect, useRef } from "react";

type LoadingMoreProps = {
  path: string;
};

export const LoadingMore = ({ path }: LoadingMoreProps) => {
  const queryClient = useQueryClient();
  const { loadMoreChildren } = useTree();
  const triggered = useRef(false);

  useEffect(() => {
    // Prevent multiple requests
    if (triggered.current) return;
    triggered.current = true;

    loadMoreChildren(path, queryClient);
  }, [path, loadMoreChildren, queryClient]);

  return (
    <Stack justify="center">
      <Loading type="inlineLoader" />
    </Stack>
  );
};
