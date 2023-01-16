import { bindDragAndDrop, bindSelectNode, bindZoomAndPan } from "./events.js";
import { D3Simulation } from "./D3Simulation";
import { D3LinkType, D3NodeType, LinkType, NodeType } from "./model/data";
import { Config } from "./model/config";
import { bindMouseOverLink } from "./hover";
import { D3Selection, GEl, PathEl, SVGEl } from "./model/d3";
import { create } from "d3";
import { DataReader } from "./data/DataReader";

export class D3Renderer {
  readonly #config: Config;
  private rootEl!: SVGEl;
  private viewPortEl!: GEl;
  private links?: PathEl<D3LinkType>;
  private linkHovers?: PathEl<LinkType>;
  private nodesEl?: GEl<D3NodeType, SVGGElement>;
  readonly #simulation: D3Simulation;
  readonly #data: DataReader;

  constructor(config: Config, data: DataReader) {
    this.#config = config;
    this.#data = data;
    this.#simulation = new D3Simulation(config);
    this.#simulation.onTick(() => this.tick());
    this.#simulation.onEnd(() => this.#updateHoversRegions());
  }

  get htmlEl() {
    return this.rootEl.node();
  }

  build() {
    const svg = buildSvg(this.#config);
    addDefsToSvg(svg);
    this.viewPortEl = svg.append("g").attr("id", "view-port");
    this.rootEl = svg;
    bindZoomAndPan(svg, this.viewPortEl);
  }

  refresh() {
    this.#updateLinks(this.#data.links);
    this.#updateNodes(this.#data.nodes as NodeType[]);
    this.#simulation.resetData(this.#data.nodes as NodeType[], this.#data.links);
  }

  #updateNodes(nodes: NodeType[]) {
    this.nodesEl?.on(".", null);
    this.nodesEl?.remove();
    this.nodesEl = buildNodes(this.#config, this.viewPortEl, nodes);
    bindDragAndDrop(this.nodesEl, this.#simulation);
    bindSelectNode(this.nodesEl, this.#data);
  }

  #updateLinks(links: LinkType[]) {
    this.links?.on(".", null);
    this.links?.remove();
    this.links = buildLinks(this.#config, this.viewPortEl, links, "links");
    this.linkHovers = buildLinks(this.#config, this.viewPortEl, links, "linkHovers");
    bindMouseOverLink(this.links, this.#data);
  }

  private tick() {
    this.links?.attr("d", (d) => plotLinkD(this.#config, d));
    this.linkHovers?.attr("d", (d) => plotLinkD(this.#config, d));
    this.nodesEl?.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  #updateHoversRegions() {}
}

function buildSvg({ width, height, curvedArrows }: Config): SVGEl {
  return create("svg").attr("id", "nms-graph").attr("viewBox", [0, 0, width, height]).classed("arrows", curvedArrows);
}

function addDefsToSvg(svg: D3Selection<SVGSVGElement>) {
  const defs = svg.append("defs");

  defs
    .append("marker")
    .attr("id", `arrow-basic`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", `#7f7f7f`)
    .attr("d", "M0,-5L10,0L0,5");

  defs
    .append("marker")
    .attr("id", `arrow-highlight`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", `#f8bc63`)
    .attr("d", "M0,-5L10,0L0,5");
  return svg;
}

function buildLinks({}: Config, svg: GEl, data: LinkType[] = [], className: string) {
  let linksGroup: GEl = svg.select("." + className);
  if (linksGroup.empty()) {
    linksGroup = svg.append("g").classed(className, true);
  }

  return linksGroup.selectAll("path").data(data).join("path") as PathEl<LinkType>;
}

function buildNodes({ iconSize }: Config, svg: GEl, data: NodeType[] = []) {
  let nodeGroup: GEl = svg.select(".nodes");
  if (nodeGroup.empty()) {
    nodeGroup = svg.append("g").classed("nodes", true);
  }
  const node = nodeGroup.selectAll(".node").data(data).join("g").classed("node", true);
  node.append("circle").attr("r", (d) => nodeValueRadius(d.value, iconSize));
  node
    .append("svg:image")
    .attr("xlink:href", (d) => `assets/${d.image}`)
    .attr("x", iconSize / -2)
    .attr("y", iconSize / -2)
    .attr("width", iconSize)
    .attr("height", iconSize);
  const text = node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", -iconSize / 2)
    .text((d) => d.name);
  text.clone(true).attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3);
  text.raise();

  const value = node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", iconSize / 2 + 8)
    .text((d) => d.value + " $");
  value.clone(true).attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3);
  value.raise();

  return node as GEl<NodeType, SVGGElement>;
}

function plotLinkD(c: Config, d: LinkType) {
  if (c.curvedArrows) {
    return linkArc(c, d);
  }
  return linkLine(c, d);
}

function linkLine({ iconSize }: Config, d: any) {
  const arrowFix = 2;
  const R = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  const r = nodeValueRadius(d.source.value, iconSize);
  const x = (r * (d.target.x - d.source.x)) / R + d.source.x;
  const y = (r * (d.target.y - d.source.y)) / R + d.source.y;

  const r1 = nodeValueRadius(d.target.value, iconSize) + arrowFix;
  const x1 = (r1 * (d.source.x - d.target.x)) / R + d.target.x;
  const y1 = (r1 * (d.source.y - d.target.y)) / R + d.target.y;

  return `M${x},${y}
          ${x1},${y1}`;
}

function linkArc({ iconSize }: Config, d: any) {
  const arrowFix = 2;
  const R = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  const r = nodeValueRadius(d.source.value, iconSize);
  const x = (r * (d.target.x - d.source.x)) / R + d.source.x;
  const y = (r * (d.target.y - d.source.y)) / R + d.source.y;

  const r1 = nodeValueRadius(d.target.value, iconSize) + arrowFix;
  const x1 = (r1 * (d.source.x - d.target.x)) / R + d.target.x;
  const y1 = (r1 * (d.source.y - d.target.y)) / R + d.target.y;

  if (isNaN(x) || isNaN(y)) {
    return "";
  }
  return `
    M${x},${y}
    A${R},${R} 0 0 0 ${x1},${y1}
  `;
}

function nodeValueRadius(value: string | number, iconSize: number) {
  const fixedVal = Number(value) || 1;
  return Math.log2(fixedVal) + iconSize / 2 + 2;
}
