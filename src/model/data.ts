import { SimulationNodeDatum } from "d3-force";

export type NodeType = {
  category: string;
  id: number;
  image: string;
  name: string;
  type: string;
  value: number;
};
export type D3NodeType = SimulationNodeDatum & NodeType;

export type LinkType = {
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
