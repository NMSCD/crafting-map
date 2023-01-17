import { Selection } from "d3-selection";

export type SVGEl<D = undefined> = Selection<SVGSVGElement, D, null, undefined>;
export type GEl<D = undefined> = Selection<SVGGElement, D, null, undefined>;
export type PathEl<D = undefined> = Selection<SVGPathElement, D, SVGGElement, never>;
