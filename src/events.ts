import { haveCommonElements } from "./utils.mjs";
import { ConfigBuilder } from "./ConfigBuilder.mjs";

// @ts-ignore
const { select, zoom, drag } = d3;

const height = window.innerHeight;
const width = window.innerWidth;

export function bindZoomAndPan(svg) {
  function handleZoom(e) {
    svg.select(".nodes").attr("transform", e.transform);
    svg.select(".links").attr("transform", e.transform);
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
    groupLinks
      .transition()
      .duration("50")
      .attr("stroke", `#f8bc63`)
      // @ts-ignore
      .attr("marker-end", () => `url(${new URL(`#arrow-highlight`, location)})`);

    const connections = data.connectionsDataByIdxes(d.connectionIdx);
    let linkInfo = connectionsToHtml(connections);
    tooltip.html(linkInfo);
  }

  function hideHoverInfo(d) {
    const groupLinks = findGroupedLinks(links, d);
    groupLinks
      .transition()
      .duration("50")
      .attr("stroke", `#7f7f7f`)
      // @ts-ignore
      .attr("marker-end", () => `url(${new URL(`#arrow-basic`, location)})`);

    tooltip.transition().duration(150).style("opacity", "0");
    tooltip.style("display", "none");
    clearTimeout(hoverTimerHandler);
  }

  links.on("mouseover", function (event, d) {
    showHoverInfo(event, d);
  });

  links.on("mouseout", function (event, d) {
    hideHoverInfo(d);
  });
}
