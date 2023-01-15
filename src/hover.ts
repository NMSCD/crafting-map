import { haveCommonElements } from "./utils.mjs";
import { selectAll } from "d3";
import { TooltipRenderer } from "./tooltip";
import { LinkType } from "./model/data";
import { DataReader } from "./data/DataReader";

const tooltip = new TooltipRenderer();

export function bindMouseOverLink(links, data: DataReader) {
  function findGroupedLinks(links, d) {
    return links.filter((l) => haveCommonElements(l.connectionIdx, d.connectionIdx));
  }

  function showHoverInfo(event, d) {
    const groupLinks = findGroupedLinks(links, d);
    groupLinks.classed("hover", true);
  }

  function hideHoverInfo(d) {
    const groupLinks = findGroupedLinks(links, d);
    groupLinks.classed("hover", false);
  }

  const hoverableLinks = selectAll("svg .linkHovers path");

  hoverableLinks.on("mouseover", function (event, d: LinkType) {
    showHoverInfo(event, d);
    tooltip.show(event.x, event.y, data.connectionsDataByIdxes(d.connectionIdx));
  });

  hoverableLinks.on("mouseout", function (event, d) {
    hideHoverInfo(d);
    tooltip.hide();
  });
}
