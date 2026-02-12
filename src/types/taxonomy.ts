export type NodeDto = {
  id: number;
  path: string;
  name: string;
  size: number;
  depth: number;
  childCount?: number;
};
