export type NodeType = {
  category: string;
  id: number;
  image: string;
  name: string;
  type: string;
  value: number;
};
type LinkType = {
  source: number;
  target: number;
  connectionIdx: number[];
};
export type ConnectionType = {
  connectionIdx: number;
  count: number;
  source: { id: number; count: number }[];
  targetId: number;
  type: string;
};
export type DataType = {
  nodes?: NodeType[];
  links?: LinkType[];
  connections?: ConnectionType[];
};
