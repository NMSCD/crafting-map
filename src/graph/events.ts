import { GEl, SVGEl } from "../model/d3";
import { drag, select, zoom } from "d3";
import { NodeType } from "../model/data";
import { SearchAction } from "../model/search";
import { clamp } from "../utils";

const height = window.innerHeight;
const width = window.innerWidth;

export function bindZoomAndPan(svg: SVGEl, viewPort: GEl) {
  function handleZoom(e: any) {
    viewPort.attr("transform", e.transform);
  }

  svg.call(zoom().on("zoom", handleZoom) as never);
}

export function bindDragAndDrop(nodes: GEl<NodeType>, changeCb: () => void) {
  nodes.call(
    drag<SVGGElement, NodeType>()
      .on("start", function () {
        select(this).classed("fixed", true);
      })
      .on("drag", function (event: MouseEvent, d: NodeType) {
        d.fx = clamp(event.x, 0, width);
        d.fy = clamp(event.y, 0, height);
        changeCb();
      })
  );
  nodes.on("click", function (event: MouseEvent, d: NodeType) {
    delete d.fx;
    delete d.fy;
    select(this).classed("fixed", false);
    changeCb();
  });
}

let lastClick = {
  name: "",
  clickCount: 0,
};

export function bindSelectNode(nodes: GEl<NodeType>, configChange: (action: SearchAction, ...args: any[]) => void) {
  function targetSingleNode({ name }: NodeType) {
    if (lastClick.name === name && lastClick.clickCount === 1) {
      lastClick = {
        name: "",
        clickCount: 0,
      };
      configChange("RESET_SEARCH");
    } else if (lastClick.name === name) {
      lastClick.clickCount++;
      lastClick.name = name;
      configChange("TOGGLE_DIRECTION");
    } else {
      lastClick = {
        name,
        clickCount: 0,
      };
      configChange("SEARCH", name);
    }
  }

  nodes.on("contextmenu", (event, d) => {
    event.preventDefault();
    targetSingleNode(d);
  });
}
