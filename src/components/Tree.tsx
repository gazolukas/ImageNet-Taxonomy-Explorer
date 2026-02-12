"use client";

import { useRoot } from "@/lib/hooks";
import { Node } from "./Node";
import Loader from "./Loader";
import ErrorMsg from "./ErrorMsg";

export const Tree = () => {
  const { data: root, error, isLoading } = useRoot();

  if (error) {
    return <ErrorMsg message={error.message} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!root) {
    return (
      <p className="inlineState">
        No taxonomy data found. Run the ingest script first.
      </p>
    );
  }

  return (
    <ul className="treeList">
      <Node node={root} />
    </ul>
  );
};
