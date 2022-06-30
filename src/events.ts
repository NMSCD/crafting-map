import { ConfigBuilder } from "./ConfigBuilder.mjs";

// @ts-ignore
const { select, zoom, drag } = d3;

const height = window.innerHeight;
const width = window.innerWidth;

export function bindZoomAndPan(svg) {
  function handleZoom(e) {
    svg.select(".nodes").attr("transform", e.transform);
    svg.select(".links").attr("transform", e.transform);
    svg.select(".linkHovers").attr("transform", e.transform);
  }

  svg.call(zoom().on("zoom", handleZoom));
}

export function bindDragAndDrop(nodes, simulation) {
  const dragEvent = drag().on("start", dragstart).on("drag", dragged);
  nodes.call(dragEvent).on("click", click);

  function click(event, d) {
    delete d.fx;
    delete d.fy;
    select(this).classed("fixed", false);
    simulation.restart();
  }

  function dragstart() {
    select(this).classed("fixed", true);
  }

  function dragged(event, d) {
    d.fx = clamp(event.x, 0, width);
    d.fy = clamp(event.y, 0, height);
    simulation.restart();
  }

  function clamp(x, lo, hi) {
    return x < lo ? lo : x > hi ? hi : x;
  }
}

export function bindSelectNode(nodes, data) {
  function targetSingleNode({ id }) {
    const node = select(`.node[data-target="${id}"]`);
    node.classed("node targeted", true);
    const text = node.select("text").text();
    data.changeConfig(new ConfigBuilder(data.config).search(text).build());
  }

  function handleSelectiveDisplay() {
    return (event, d) => {
      event.preventDefault();
      targetSingleNode(d);
    };
  }

  nodes.on("contextmenu", handleSelectiveDisplay());
}
