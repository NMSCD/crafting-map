import { BaseType, Selection } from "d3-selection";

export type SVGEl<D = undefined> = Selection<SVGSVGElement, D, null, undefined>;
export type GEl<D = undefined, P extends BaseType = null> = Selection<SVGGElement, D, P, undefined>;
export type PathEl<D = undefined> = Selection<SVGPathElement, D, SVGGElement, any>;
export type D3Selection<K extends BaseType> = Selection<K, undefined, null, undefined>;
