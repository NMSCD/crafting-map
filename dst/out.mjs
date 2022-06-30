(() => {
  // src/ConfigBuilder.mjs
  var ConfigBuilder = class {
    #config;
    constructor(config2 = {}) {
      this.#config = config2;
    }
    search(value) {
      if (!value) {
        delete this.#config.search;
        return this;
      }
      delete this.#config.clickId;
      this.#config.search = value;
      return this;
    }
    clickId(value) {
      if (!value) {
        delete this.#config.clickId;
        return this;
      }
      delete this.#config.search;
      this.#config.clickId = value;
      return this;
    }
    direction(value) {
      this.#config.direction = value;
      return this;
    }
    build() {
      return this.#config;
    }
  };

  // src/events.ts
  var { select, zoom, drag } = d3;
  var height = window.innerHeight;
  var width = window.innerWidth;
  function bindZoomAndPan(svg) {
    function handleZoom(e) {
      svg.select(".nodes").attr("transform", e.transform);
      svg.select(".links").attr("transform", e.transform);
      svg.select(".linkHovers").attr("transform", e.transform);
    }
    svg.call(zoom().on("zoom", handleZoom));
  }
  function bindDragAndDrop(nodes, simulation) {
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
  function bindSelectNode(nodes, data2) {
    function targetSingleNode({ id }) {
      const node = select(`.node[data-target="${id}"]`);
      node.classed("node targeted", true);
      const text = node.select("text").text();
      data2.changeConfig(new ConfigBuilder(data2.config).search(text).build());
    }
    function handleSelectiveDisplay() {
      return (event, d) => {
        event.preventDefault();
        targetSingleNode(d);
      };
    }
    nodes.on("contextmenu", handleSelectiveDisplay());
  }

  // src/D3Simulation.ts
  var { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } = window.d3;
  var D3Simulation = class {
    #simulation;
    #config;
    constructor(config2) {
      this.#config = config2;
      this.#simulation = createSimulation(config2);
    }
    restart() {
      this.#simulation.alpha(1).restart();
    }
    resetData(nodes, links) {
      this.#simulation.nodes(nodes);
      this.#simulation.force("link").links(links);
      this.#simulation.force("charge").strength(-5);
      this.#simulation.force("colide").strength(0.5);
      this.restart();
    }
    onTick(cb) {
      this.#simulation.on("tick", cb);
    }
    onEnd(cb) {
      this.#simulation.on("end", cb);
    }
  };
  function createSimulation({ width: width3, height: height3, collisionRadius }) {
    return forceSimulation().nodes([]).force("charge", forceManyBody()).force("center", forceCenter(width3 / 2, height3 / 2)).force("colide", forceCollide(collisionRadius)).force("link", forceLink());
  }

  // src/utils.mjs
  function haveCommonElements(arrA, arrB) {
    return arrA.some((a) => {
      return arrB.some((b) => {
        return a === b;
      });
    });
  }

  // src/hover.ts
  var { selectAll, select: select2 } = d3;
  function bindMouseOverLink(links, data2) {
    const tooltip = select2("body").append("div").attr("id", "hoverInfo").style("opacity", "0").text("a simple tooltip");
    function showTooltip({ x, y }) {
      tooltip.style("top", y + "px").style("left", x + 10 + "px");
      tooltip.style("display", "block");
      tooltip.transition().duration(150).style("opacity", "0.9");
    }
    function findGroupedLinks(links2, d) {
      return links2.filter((l) => haveCommonElements(l.connectionIdx, d.connectionIdx));
    }
    function connectionToHtml(data3) {
      let html = data3.source.map((s) => {
        return `<div>${s.count}</div> <img src="assets/${s.image}"/>`;
      });
      html = html.join("");
      html += `<div>=  ${data3.count}</div> <img src="assets/${data3.image}"/>`;
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
      const connections = data2.connectionsDataByIdxes(d.connectionIdx);
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
    hoverableLinks.on("mouseover", function(event, d) {
      showHoverInfo(event, d);
    });
    hoverableLinks.on("mouseout", function(event, d) {
      hideHoverInfo(d);
    });
  }

  // src/D3Renderer.ts
  var { create } = d3;
  var D3Renderer = class {
    #config;
    #svg;
    #nodes;
    #links;
    #linkHovers;
    #simulation;
    #data;
    constructor(config2, data2) {
      this.#config = config2;
      this.#data = data2;
      this.#simulation = new D3Simulation(config2);
      this.#simulation.onTick(() => this.#tick());
      this.#simulation.onEnd(() => this.#updateHoversRegions());
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
      this.#linkHovers = buildHovers(this.#config, this.#svg, links);
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
    #updateHoversRegions() {
      this.#linkHovers.attr("d", (d) => linkArc(this.#config, d));
    }
  };
  function buildSvg({ width: width3, height: height3 }) {
    const svg = create("svg").attr("id", "nms-graph").attr("viewBox", [0, 0, width3, height3]);
    addArrowHeadDefs(svg);
    return svg;
  }
  function addArrowHeadDefs(svg) {
    const defs = svg.append("defs");
    defs.append("marker").attr("id", `arrow-basic`).attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0).attr("markerWidth", 4).attr("markerHeight", 4).attr("orient", "auto").append("path").attr("fill", `#7f7f7f`).attr("d", "M0,-5L10,0L0,5");
    defs.append("marker").attr("id", `arrow-highlight`).attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0).attr("markerWidth", 4).attr("markerHeight", 4).attr("orient", "auto").append("path").attr("fill", `#f8bc63`).attr("d", "M0,-5L10,0L0,5");
    return svg;
  }
  function buildLinks({}, svg, data2 = []) {
    let linksGroup = svg.select(".links");
    if (linksGroup.empty()) {
      linksGroup = svg.append("g").classed("links", true);
    }
    return linksGroup.selectAll("path").data(data2).join("path").attr("data-target", (d) => d.target);
  }
  function buildHovers({}, svg, data2 = []) {
    let linksGroup = svg.select(".linkHovers");
    if (linksGroup.empty()) {
      linksGroup = svg.append("g").classed("linkHovers", true);
    }
    return linksGroup.selectAll("path").data(data2).join("path").attr("data-target", (d) => d.target);
  }
  function buildNodes({ iconSize: iconSize2 }, svg, data2 = []) {
    let nodeGroup = svg.select(".nodes");
    if (nodeGroup.empty()) {
      nodeGroup = svg.append("g").classed("nodes", true);
    }
    const node = nodeGroup.selectAll(".node").data(data2).join("g").classed("node", true).attr("data-target", (d) => d.id);
    node.append("circle").attr("r", (d) => nodeValueRadius(d.value, iconSize2)).classed("fixed", (d) => d.fx !== void 0);
    node.append("svg:image").attr("xlink:href", (d) => `assets/${d.image}`).attr("x", iconSize2 / -2).attr("y", iconSize2 / -2).attr("width", iconSize2).attr("height", iconSize2);
    const text = node.append("text").attr("text-anchor", "middle").attr("x", 0).attr("y", -iconSize2 / 2).text((d) => d.name);
    text.clone(true).attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3);
    text.raise();
    const value = node.append("text").attr("text-anchor", "middle").attr("x", 0).attr("y", iconSize2 / 2 + 8).text((d) => d.value + " $");
    value.clone(true).attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3);
    value.raise();
    return node;
  }
  function linkArc({ iconSize: iconSize2 }, d) {
    const arrowFix = 2;
    const R = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    const r = nodeValueRadius(d.source.value, iconSize2);
    const x = r * (d.target.x - d.source.x) / R + d.source.x;
    const y = r * (d.target.y - d.source.y) / R + d.source.y;
    const r1 = nodeValueRadius(d.target.value, iconSize2) + arrowFix;
    const x1 = r1 * (d.source.x - d.target.x) / R + d.target.x;
    const y1 = r1 * (d.source.y - d.target.y) / R + d.target.y;
    if (isNaN(x) || isNaN(y)) {
      return "";
    }
    return `
    M${x},${y}
    A${R},${R} 0 0 0 ${x1},${y1}
  `;
  }
  function nodeValueRadius(value, iconSize2) {
    const fixedVal = Number(value) || 1;
    return Math.log2(fixedVal) + iconSize2 / 2 + 2;
  }

  // src/data/FilteredDataProvider.mjs
  var FilteredDataProvider = class {
    #data;
    #config = {};
    #filter = {};
    #initialIds;
    constructor(data2) {
      this.#data = data2;
    }
    refresh(config2) {
      this.#config = config2;
      this.#filter = {};
      this.#initialIds = void 0;
      this.#nodeIdsById();
      this.#nodeIdsBySearch();
      this.#linksIds();
    }
    get nodesIds() {
      return this.#filter.nodeIds;
    }
    get links() {
      return this.#filter.links;
    }
    #nodeIdsBySearch() {
      const search = this.#config.search?.toLowerCase();
      if (!search) {
        return;
      }
      const initialIds = this.#data.allNodes.filter((n) => n.name.toLowerCase().includes(search)).map((n) => n.id);
      this.#initialIds = initialIds;
      this.#filter.nodeIds = this.#findMultiNodeIds(initialIds);
    }
    #nodeIdsById() {
      const id = this.#config.clickId;
      if (!id) {
        return;
      }
      this.#initialIds = [id];
      this.#filter.nodeIds = this.#findMultiNodeIds([id]);
    }
    #linksIds() {
      let ids = this.#initialIds;
      if (!ids) {
        return;
      }
      const keyA = this.#config.direction ? "target" : "source";
      this.#filter.links = this.#data.allLinks.filter((l) => ids.includes(l[keyA].id));
    }
    #findMultiNodeIds(ids) {
      const d3LinkData = this.#data.allLinks;
      const keyA = this.#config.direction ? "target" : "source";
      const keyB = !this.#config.direction ? "target" : "source";
      const nodeIds = d3LinkData.reduce((acc, value) => {
        if (ids.includes(value[keyA].id) && !acc.includes(value[keyB].id)) {
          return [...acc, value[keyB].id];
        }
        return acc;
      }, [...ids]);
      return [...new Set(nodeIds)];
    }
  };

  // src/data/DataReader.ts
  var { autoType, csvParse } = d3;
  function parseCSVConnections(data2, nodes) {
    return data2.map((c, idx) => {
      const source = [];
      if (!c.Source_1) {
        throw new Error("parsing error!");
      }
      source.push({
        id: nodes.get(c.Source_1).id,
        count: c.Count_1
      });
      if (c.Source_2) {
        source.push({
          id: nodes.get(c.Source_2).id,
          count: c.Count_2
        });
      }
      if (c.Source_3) {
        source.push({
          id: nodes.get(c.Source_3).id,
          count: c.Count_3
        });
      }
      return {
        source,
        targetId: nodes.get(c.Target).id,
        count: c.TargetCount,
        connectionIdx: idx,
        type: c.Type
      };
    });
  }
  function parseConnectionsToLinks(connections) {
    const links = /* @__PURE__ */ new Map();
    connections.forEach((c, idx) => {
      c.source.forEach((source) => {
        const key = `${source.id}_${c.targetId}`;
        if (links.has(key)) {
          links.get(key).connectionIdx = [...links.get(key).connectionIdx, idx];
        } else {
          links.set(key, {
            source: source.id,
            target: c.targetId,
            connectionIdx: [idx]
          });
        }
      });
    });
    return links;
  }
  var DataReader = class {
    #data = {};
    #config = {};
    #filtered;
    #configCB$;
    constructor() {
      this.#filtered = new FilteredDataProvider(this);
    }
    get nodes() {
      let ids = this.#filtered.nodesIds;
      if (ids) {
        return this.#data.nodes.filter((n) => ids.includes(n.id));
      }
      return this.#data.nodes;
    }
    get links() {
      return this.#filtered.links || this.#data.links;
    }
    set config(config2) {
      this.#config = config2;
      this.#filtered.refresh(config2);
    }
    changeConfig(config2) {
      this.config = config2;
      this.#configCB$(config2);
    }
    config$(cb) {
      this.#configCB$ = cb;
    }
    get config() {
      return this.#config;
    }
    get allNodes() {
      return this.#data.nodes;
    }
    get allLinks() {
      return this.#data.links;
    }
    connectionsDataByIdxes(idxs) {
      const connections = idxs.map((idx) => this.#data.connections[idx]);
      return connections.map((c) => {
        return {
          ...c,
          ...this.#data.nodes.find((node) => node.id === c.targetId),
          source: c.source.map((s) => {
            return {
              ...this.#data.nodes.find((node) => node.id === s.id),
              ...s
            };
          })
        };
      });
    }
    async fetchCSV$() {
      let response = await fetch("assets/data/nodes.csv");
      let data2 = await response.text();
      const nodes = parseCSVNodes(csvParse(data2, autoType));
      response = await fetch("assets/data/connections.csv");
      data2 = await response.text();
      const connections = parseCSVConnections(csvParse(data2, autoType), nodes);
      const links = parseConnectionsToLinks(connections);
      this.#data.nodes = [...nodes.values()];
      this.#data.connections = connections;
      this.#data.links = [...links.values()];
    }
  };
  function parseCSVNodes(nodeArray) {
    const nodeMap = /* @__PURE__ */ new Map();
    nodeArray.forEach((n, idx) => {
      nodeMap.set(n.Name, {
        name: n.Name,
        id: idx,
        category: n.Category,
        type: n.Type,
        value: n.Value,
        image: n.Image
      });
    });
    return nodeMap;
  }

  // src/index.ts
  var el = document.querySelector("#graph");
  var menuEl = document.querySelector("ak-menu");
  var height2 = window.innerHeight;
  var width2 = window.innerWidth;
  var iconSize = 32;
  var config = { width: width2, height: height2, iconSize, collisionRadius: iconSize * 3 };
  var data = new DataReader();
  var renderer = new D3Renderer(config, data);
  renderer.build();
  data.fetchCSV$().then(() => {
    renderer.refresh();
  });
  data.config$((config2) => {
    menuEl.resetFilters(config2);
    renderer.refresh();
  });
  menuEl.addEventListener("filter", ({ detail }) => {
    data.config = new ConfigBuilder().search(detail.search).direction(detail.direction).clickId(detail.clickId).build();
    renderer.refresh();
  });
  el.append(renderer.htmlEl);
})();
//# sourceMappingURL=out.mjs.map
