"use client";

import { useTree } from "@/lib/store";
import {
  ChevronDown,
  ChevronForward,
  CircleSmall,
} from "@kiwicom/orbit-components/icons";
import type { NodeDto } from "@/types/taxonomy";

type ToggleIconProps = {
  node: NodeDto;
};

export const ToggleIcon = ({ node }: ToggleIconProps) => {
  const { expanded } = useTree();

  const hasChildren = (node.childCount ?? 0) > 0;
  const isExpanded = expanded.has(node.path);

  if (hasChildren) {
    return isExpanded ? <ChevronDown /> : <ChevronForward />;
  }

  return <CircleSmall />;
};
