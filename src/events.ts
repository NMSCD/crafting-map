import { ConfigBuilder } from "./ConfigBuilder.js";
import { GEl, SVGEl } from "./model/d3";
import { drag, select, zoom } from "d3";
import { DataReader } from "./data/DataReader";
import { NodeType } from "./model/data";

const height = window.innerHeight;
const width = window.innerWidth;

export function bindZoomAndPan(svg: SVGEl, viewPort: GEl) {
  function handleZoom(e: any) {
    viewPort.attr("transform", e.transform);
  }

  svg.call(zoom().on("zoom", handleZoom) as never);
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

let lastClick = {
  name: "",
  clickCount: 0,
};

export function bindSelectNode(nodes: GEl<NodeType, SVGGElement>, data: DataReader) {
  function targetSingleNode({ name }) {
    if (lastClick.name === name && lastClick.clickCount === 1) {
      lastClick = {
        name: "",
        clickCount: 0,
      };
      data.changeConfig(new ConfigBuilder({ search: "", direction: true }).build());
    } else if (lastClick.name === name) {
      lastClick.clickCount++;
      lastClick.name = name;
      data.changeConfig(new ConfigBuilder().search(name).direction(!data.searchOpts.direction).build());
    } else {
      lastClick = {
        name,
        clickCount: 0,
      };
      data.changeConfig(new ConfigBuilder(data.searchOpts).search(name).build());
    }
  }

  function handleSelectiveDisplay() {
    return (event, d) => {
      event.preventDefault();
      targetSingleNode(d);
    };
  }

  nodes.on("contextmenu", handleSelectiveDisplay());
}
