"use client";

import type { CSSProperties } from "react";
import { Badge, Button, ButtonLink, Stack } from "@kiwicom/orbit-components";
import { useQueryClient } from "@tanstack/react-query";
import { useTree } from "@/lib/store";
import type { NodeDto } from "@/types/taxonomy";
import { ToggleIcon } from "./ToggleIcon";

const rowBase: CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "center",
  padding: "3px 0",
};

type NodeProps = {
  node: NodeDto;
  depth: number;
};

export const Node = ({ node, depth }: NodeProps) => {
  const queryClient = useQueryClient();
  const { selectedPath, toggleNode, selectNode } = useTree();

  const hasChildren = (node.childCount ?? 0) > 0;
  const isSelected = selectedPath === node.path;

  return (
    <div style={{ ...rowBase, paddingLeft: depth * 16 }}>
      <ButtonLink
        type="secondary"
        size="small"
        circled
        disabled={!hasChildren}
        iconLeft={<ToggleIcon node={node} />}
        onClick={() => toggleNode(node.path, queryClient)}
      />
      <Stack inline>
        <Button
          type={isSelected ? "secondary" : "white"}
          size="small"
          fullWidth
          iconRight={
            node.size > 0 && <Badge type="infoSubtle">{node.size}</Badge>
          }
          onClick={() => selectNode(node.path)}
        >
          {node.name}
        </Button>
      </Stack>
    </div>
  );
};
