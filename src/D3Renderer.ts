import { bindDragAndDrop, bindSelectNode, bindZoomAndPan } from "./events.js";
import { D3Simulation } from "./D3Simulation";
import { LinkType, NodeType } from "./model/data";
import { Config } from "./model/config";
import { bindMouseOverLink } from "./hover";
import { GEl, PathEl, SVGEl } from "./model/d3";
import { create } from "d3";
import { D3StarsRenderer } from "./D3StarsRenderer";
import { DataReader } from "./data/DataReader";
import { SearchAction } from "./model/search";

export class D3Renderer {
  private viewPortEl!: GEl;
  private links?: PathEl<LinkType>;
  private linkHovers?: PathEl<LinkType>;
  private nodesEl?: GEl<NodeType>;

  private readonly config: Config;
  private readonly simulation: D3Simulation;
  private readonly stars: D3StarsRenderer;
  private configCb$: (action: SearchAction, ...args: any[]) => void = () => {};

  constructor(config: Config) {
    this.config = config;
    this.simulation = new D3Simulation(config);
    this.stars = new D3StarsRenderer(config.starsAnimation, this.simulation);
    this.simulation.onTick(() => this.tick());
  }

  get htmlEl() {
    return this.viewPortEl.node()?.parentNode as ParentNode;
  }

  build() {
    const svg = buildSvg(this.config);
    addDefsToSvg(svg);
    this.viewPortEl = svg.append("g").attr("id", "view-port") as GEl;
    this.stars.build(this.viewPortEl);
    bindZoomAndPan(svg, this.viewPortEl);
  }

  refresh(data: DataReader) {
    this.updateLinks(data.links);
    this.updateNodes(data.nodes);
    this.simulation.resetData(data.nodes, data.links);
  }

  private updateNodes(nodes: NodeType[]) {
    this.nodesEl?.on(".", null);
    this.nodesEl?.remove();
    this.nodesEl = buildNodes(this.config, this.viewPortEl, nodes);
    bindDragAndDrop(this.nodesEl, () => {
      this.simulation.restart();
      this.stars.removeStars();
    });
    bindSelectNode(this.nodesEl, this.configCb$);
  }

  private updateLinks(links: LinkType[]) {
    this.links?.on(".", null);
    this.links?.remove();
    this.links = buildLinks(this.viewPortEl, links, "links");
    this.linkHovers = buildLinks(this.viewPortEl, links, "linkHovers");
    bindMouseOverLink(this.links);
    this.stars.updateLinks(links as any);
  }

  private tick() {
    this.links?.attr("d", (d) => plotLinkD(this.config, d));
    this.linkHovers?.attr("d", (d) => plotLinkD(this.config, d));
    this.nodesEl?.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  config$(cb: (action: SearchAction, ...args: any[]) => void) {
    this.configCb$ = cb;
  }
}

function buildSvg({ width, height, curvedArrows }: Config): SVGEl {
  return create("svg").attr("id", "nms-graph").attr("viewBox", [0, 0, width, height]).classed("arrows", curvedArrows);
}

function addDefsToSvg(svg: SVGEl) {
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

  radialGradients(defs);
  return svg;
}

function appendChildGEl(parent: GEl, className: string) {
  let el: GEl = parent.select("." + className);
  if (el.empty()) {
    el = parent.append("g").classed(className, true);
  }
  return el;
}

function buildLinks(svg: GEl, data: LinkType[] = [], className: string) {
  return appendChildGEl(svg, className).selectAll("path").data(data).join("path") as any as PathEl<LinkType>;
}

function radialGradients(el: any) {
  const grad = el
    .append("radialGradient")
    .attr("id", "grad")
    .attr("gradientUnits", "objectBoundingBox")
    .attr("gradientTransform", `matrix(10,0,0,0.5,-5,.25)`);

  grad.append("stop").attr("id", "stop0").attr("offset", 0);
  grad.append("stop").attr("id", "stop1").attr("offset", 1);

  const gradFixed = grad.clone().attr("id", "gradFixed").attr("gradientTransform", `matrix(10,0,0,1,-5,0)`);

  gradFixed.append("stop").attr("id", "stop2").attr("offset", 0);
  gradFixed.append("stop").attr("id", "stop3").attr("offset", 1);
}

function buildNodes({ iconSize }: Config, svg: GEl, data: NodeType[] = []) {
  const node = appendChildGEl(svg, "nodes")
    .selectAll(".node")
    .data(data)
    .join("g")
    .classed("node", true)
    .classed("fixed", (d) => !!d.fx || !!d.fy) as GEl<NodeType>;

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

  return node;
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
