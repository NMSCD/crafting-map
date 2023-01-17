import { haveCommonElements } from "../utils.js";
import { selectAll } from "d3";
import { TooltipRenderer } from "../UI/tooltip";
import { LinkType } from "../model/data";
import { PathEl } from "../model/d3";

const tooltip = new TooltipRenderer();

export function bindMouseOverLink(links: PathEl<LinkType>) {
  function findGroupedLinks(d: LinkType) {
    return links.filter((l) => haveCommonElements(l.connections, d.connections));
  }

  function showHoverInfo(event: MouseEvent, d: LinkType) {
    const groupLinks = findGroupedLinks(d);
    groupLinks.classed("hover", true);
  }

  function hideHoverInfo(d: LinkType) {
    const groupLinks = findGroupedLinks(d);
    groupLinks.classed("hover", false);
  }

  const hoverableLinks = selectAll<never, LinkType>("svg .linkHovers path");

  hoverableLinks.on("mouseover", function (event: MouseEvent, d) {
    showHoverInfo(event, d);
    tooltip.show(event.x, event.y, d.connections);
  });

  hoverableLinks.on("mouseout", function (_, d) {
    hideHoverInfo(d);
    tooltip.hide();
  });
}
