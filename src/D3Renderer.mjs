import { create } from "https://cdn.skypack.dev/d3-selection@3";

import { bindDragAndDrop, bindMouseOverLink, bindSelectNode, bindZoomAndPan } from "./events.mjs";
import { D3Simulation } from "./D3Simulation.mjs";

export class D3Renderer {
  #config;
  #svg;
  #nodes;
  #links;
  #simulation;
  #data;

  constructor(config, data) {
    this.#config = config;
    this.#data = data;
    this.#simulation = new D3Simulation(config);
    this.#simulation.onTick(() => this.#tick());
  }

  build() {
    this.#svg = buildSvg(this.#config);
    this.#links = buildLinks(this.#config, this.#svg);
    this.#nodes = buildNodes(this.#config, this.#svg);
    bindZoomAndPan(this.#svg);
  }

  #updateNodes(nodes) {
    this.#nodes.on(".", null);
    this.#nodes.remove();
    this.#nodes = buildNodes(this.#config, this.#svg, nodes);
    bindDragAndDrop(this.#nodes, this.#simulation);
    bindSelectNode(this.#nodes, this.#data);
  }

  #updateLinks(links) {
    this.#links.on(".", null);
    this.#links.remove();
    this.#links = buildLinks(this.#config, this.#svg, links);
    bindMouseOverLink(this.#links, this.#data);
  }

  #tick() {
    this.#links.attr("d", (d) => linkArc(this.#config, d));
    this.#nodes.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  get htmlEl() {
    return this.#svg.node();
  }

  refresh() {
    this.#updateNodes(this.#data.nodes);
    this.#updateLinks(this.#data.links);
    this.#simulation.resetData(this.#data.nodes, this.#data.links);
  }
}

function buildSvg({ width, height }) {
  const svg = create("svg").attr("id", "nms-graph").attr("viewBox", [0, 0, width, height]);
  addArrowHeadDefs(svg);
  return svg;
}

function addArrowHeadDefs(svg) {
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

function buildLinks({}, svg, data = []) {
  let linksGroup = svg.select(".links");
  if (linksGroup.empty()) {
    linksGroup = svg.append("g").classed("links", true).attr("fill", "none").attr("stroke-width", 2);
  }

  return linksGroup
    .selectAll("path")
    .data(data)
    .join("path")
    .attr("data-target", (d) => d.target)
    .attr("stroke", () => `#7f7f7f`)
    .attr("marker-end", () => `url(${new URL(`#arrow-basic`, location)})`);
}

function buildNodes({ iconSize }, svg, data = []) {
  let nodeGroup = svg.select(".nodes");
  if (nodeGroup.empty()) {
    nodeGroup = svg.append("g").classed("nodes", true);
  }
  const node = nodeGroup
    .selectAll(".node")
    .data(data)
    .join("g")
    .classed("node", true)
    .attr("data-target", (d) => d.id);
  node
    .append("circle")
    .attr("r", (d) => nodeValueRadius(d.value, iconSize))
    .classed("fixed", (d) => d.fx !== undefined);
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

function linkArc({ iconSize }, d) {
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

function nodeValueRadius(value, iconSize) {
  const fixedVal = Number(value) || 1;
  return Math.log2(fixedVal) + iconSize / 2 + 2;
}
