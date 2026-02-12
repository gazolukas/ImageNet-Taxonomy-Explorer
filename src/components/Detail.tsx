"use client";

import { useDetail, useTree } from "@/lib/hooks";
import Loader from "./Loader";
import ErrorMsg from "./ErrorMsg";

export const Detail = () => {
  const { selectedPath } = useTree();
  const { data: node, isLoading, error } = useDetail(selectedPath);

  if (error) {
    return <ErrorMsg message={error.message} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!node) {
    return <p>Select a taxonomy node to inspect metadata.</p>;
  }

  return (
    <dl>
      {node.name && (
        <div>
          <dt>Name</dt>
          <dd>{node.name}</dd>
        </div>
      )}
      {node.path && (
        <div>
          <dt>Path</dt>
          <dd className="mono">{node.path}</dd>
        </div>
      )}
      {node.depth > 0 && (
        <div>
          <dt>Depth</dt>
          <dd>{node.depth}</dd>
        </div>
      )}
      {Boolean(node.childCount) && (
        <div>
          <dt>Children</dt>
          <dd>{node.childCount ?? 0}</dd>
        </div>
      )}
      {node.size > 0 && (
        <div>
          <dt>Size</dt>
          <dd>{node.size}</dd>
        </div>
      )}
    </dl>
  );
};
