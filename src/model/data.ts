import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

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
  twoWay?: boolean;
};
export type D3LinkType = SimulationLinkDatum<D3NodeType> & LinkType;
export type ConnectionType = {
  connectionIdx: number;
  count: number;
  source: ConnectionSource[];
  targetId: number;
  type: string;
};
export type ConnectionSource = { id: number; count: number };
export type DataType = {
  nodes?: NodeType[];
  links?: LinkType[];
  connections?: ConnectionType[];
};
