import { haveCommonElements } from "./utils.mjs";
// @ts-ignore
const { selectAll, select } = d3;

export function bindMouseOverLink(links, data) {
  const tooltip = select("body").append("div").attr("id", "hoverInfo").style("opacity", "0").text("a simple tooltip");

  function showTooltip({ x, y }) {
    tooltip.style("top", y + "px").style("left", x + 10 + "px");
    tooltip.style("display", "block");
    tooltip.transition().duration(150).style("opacity", "0.9");
  }
  function findGroupedLinks(links, d) {
    return links.filter((l) => haveCommonElements(l.connectionIdx, d.connectionIdx));
  }

  function connectionToHtml(data) {
    let html = data.source.map((s) => {
      return `<div>${s.count}</div> <img src="assets/${s.image}"/>`;
    });

    html = html.join("");
    html += `<div>=  ${data.count}</div> <img src="assets/${data.image}"/>`;
    return html;
  }

  function connectionsToHtml(connectionsData) {
    let html = connectionsData.map((c) => connectionToHtml(c));
    html = html.map((c) => `<div class="wrapper"> ${c} </div>`);
    html = html.join("");
    return html;
  }

  let hoverTimerHandler;
  function showHoverInfo(event, d) {
    hoverTimerHandler = setTimeout(() => showTooltip(event), 100);
    const groupLinks = findGroupedLinks(links, d);
    groupLinks.classed("hover", true);

    const connections = data.connectionsDataByIdxes(d.connectionIdx);
    let linkInfo = connectionsToHtml(connections);
    tooltip.html(linkInfo);
  }

  function hideHoverInfo(d) {
    const groupLinks = findGroupedLinks(links, d);
    groupLinks.classed("hover", false);

    tooltip.transition().duration(150).style("opacity", "0");
    tooltip.style("display", "none");
    clearTimeout(hoverTimerHandler);
  }

  const hoverableLinks = selectAll("svg .linkHovers path");

  hoverableLinks.on("mouseover", function (event, d) {
    showHoverInfo(event, d);
  });

  hoverableLinks.on("mouseout", function (event, d) {
    hideHoverInfo(d);
  });
}
