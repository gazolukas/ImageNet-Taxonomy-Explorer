export type NodeDto = {
  id: number;
  path: string;
  name: string;
  size: number;
  depth: number;
  childCount?: number;
};

export type ChildrenPage = {
  children: NodeDto[];
  hasMore: boolean;
};

export type FlatNodeRow = {
  type: "node";
  node: NodeDto;
  depth: number;
};

export type FlatLoadingRow = {
  type: "loading";
  parentPath: string;
  depth: number;
};

export type FlatLoadMoreRow = {
  type: "load-more";
  parentPath: string;
  depth: number;
};

export type FlatRow = FlatNodeRow | FlatLoadingRow | FlatLoadMoreRow;
