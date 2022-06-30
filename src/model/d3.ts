import { Selection } from "d3-selection";

export type D3Selection<K extends Element> = Selection<K, undefined, null, undefined>;
export type D3DataSelection<K extends Element, N> = Selection<K, N, null, undefined>;
