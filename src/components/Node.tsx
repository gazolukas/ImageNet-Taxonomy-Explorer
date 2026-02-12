"use client";

import { useEffect, useRef } from "react";
import { useChildren } from "@/lib/hooks";
import { useTree } from "@/lib/context";
import type { NodeDto } from "@/types/taxonomy";
import Loader from "./Loader";
import ErrorMsg from "./ErrorMsg";

type NodeProps = {
  node: NodeDto;
};

export const Node = ({ node }: NodeProps) => {
  const { expanded, selectedPath, toggleNode, selectNode } = useTree();
  const rowRef = useRef<HTMLDivElement>(null);

  const hasChildren = (node.childCount ?? 0) > 0;
  const isExpanded = expanded.has(node.path);
  const isSelected = selectedPath === node.path;

  const {
    data: children,
    isLoading,
    error,
  } = useChildren(isExpanded ? node.path : null);

  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  return (
    <li>
      <div ref={rowRef} className={`nodeRow ${isSelected ? "selected" : ""}`}>
        <button
          type="button"
          className="toggleButton"
          disabled={!hasChildren}
          onClick={() => toggleNode(node.path)}
        >
          {hasChildren ? (isExpanded ? "▾" : "▸") : "·"}
        </button>
        <button
          type="button"
          className="nodeButton"
          onClick={() => selectNode(node.path)}
        >
          <span>{node.name}</span>
          <span className="badge">{node.size}</span>
        </button>
      </div>
      {isExpanded && (
        <div>
          {isLoading && <Loader />}
          {error && <ErrorMsg message={error.message} />}
          {children && children.length > 0 && (
            <ul className="treeList">
              {children.map((child) => (
                <Node key={child.path} node={child} />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};
