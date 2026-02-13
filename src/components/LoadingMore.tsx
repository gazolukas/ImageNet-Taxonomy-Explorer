import { useTree } from "@/lib/context";
import { Loading, Stack } from "@kiwicom/orbit-components";
import { useEffect, useRef } from "react";

type LoadingMoreProps = {
  path: string;
};

export const LoadingMore = ({ path }: LoadingMoreProps) => {
  const { loadMoreChildren } = useTree();
  const triggered = useRef(false);

  useEffect(() => {
    // Prevent multiple requests
    if (triggered.current) return;
    triggered.current = true;

    loadMoreChildren(path);
  }, [path, loadMoreChildren]);

  return (
    <Stack justify="center">
      <Loading type="inlineLoader" />
    </Stack>
  );
};
