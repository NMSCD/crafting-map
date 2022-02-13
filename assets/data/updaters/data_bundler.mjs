import fs from "fs";

export function main() {
  const data = JSON.parse(fs.readFileSync("./temps/data.json"));
  const refining = JSON.parse(fs.readFileSync("./temps/refining.json"));
  const nodeData = JSON.parse(fs.readFileSync("./temps/nodes.json"));
  const linkingData = JSON.parse(fs.readFileSync("./temps/linking.json"));

  const nodes = new Map();
  const connections = new Map();
  const missingNodes = new Set();

  function addNodesToMap(nodes, mapNodes) {
    nodes.forEach((node) => {
      const newNode = { ...node };
      delete newNode.id;
      if (!mapNodes.has(node.name)) {
        mapNodes.set(node.name, newNode);
      }
    });
  }

  function addConnectionToMap(nodes, connections, mapConnections) {
    connections
      .map((c) => {
        const node = nodes.find((node) => node.id === c.targetId);
        c.target = node.name;
        c.source = c.source.map((s) => {
          return {
            ...s,
            name: nodes.find((node) => node.id === s.id).name,
          };
        });
        return c;
      })
      .forEach((c) => {
        mapConnections.set(c.type + "_" + c.target + "_" + c.source.map((s) => s.name).join("|"), c);
      });
  }

  function addPosibleCraftingConnections(linking, mapConnections) {
    linking.forEach((l) => {
      const cons = l.possibleLinks.map((a) => {
        const type = "crafting";
        const val = a.replace("  ", "").replace(/\n */g, " ");
        const target = val.replace(/.*?→/, "").trim();
        const source = val
          .replace(/→.+/, "")
          .split("+")
          .map((s) => s.trim())
          .map((s) => {
            const match = s.match(/^([\w -]+) x(\d+)$/);
            if (!match || !match[1] || !match[2]) {
              return null;
            }
            return {
              name: match[1],
              count: match[2],
            };
          });
        if (!/^['\w -]+$/.test(target)) {
          return null;
        }
        return {
          target,
          source,
          type,
          count: 1,
        };
      });
      cons
        .filter((c) => c && c.source.every((s) => s))
        .forEach((c) => {
          mapConnections.set(c.type + "_" + c.target + "_" + c.source.map((s) => s.name).join("|"), c);
        });
    });
  }

  function indexValues() {
    let i = 0;
    nodes.forEach((val, key, map) => {
      val.id = i++;
    });
    i = 0;
    connections.forEach((val, key, map) => {
      val.connectionIdx = i++;
      if (!nodes.has(val.target)) {
        missingNodes.add(val.target);
        map.delete(key);
        return;
      }
      val.targetId = nodes.get(val.target).id;
      val.source = val.source.map((s) => {
        if (!nodes.has(s.name)) {
          missingNodes.add(val.target);
          map.delete(key);
          return;
        }

        return {
          id: nodes.get(s.name).id,
          count: s.count,
        };
      });
    });
  }

  function removeNonConectedNodes() {}

  addNodesToMap(nodeData.nodes, nodes);
  addPosibleCraftingConnections(linkingData.linking, connections);

  addNodesToMap(data.nodes, nodes);
  addConnectionToMap(data.nodes, data.connections, connections);

  addNodesToMap(refining.nodes, nodes);
  addConnectionToMap(refining.nodes, refining.connections, connections);

  indexValues();

  removeNonConectedNodes();

  fs.writeFileSync(
    "new_data.json",
    JSON.stringify({
      nodes: [...nodes.values()],
      connections: [...connections.values()],
    })
  );
  console.log("missingNodes", [...missingNodes]);
}

// main();
