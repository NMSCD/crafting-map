import { JSDOM } from "jsdom";
import fs from "fs";
import { fetchCached } from "./utils.mjs";

export async function refining_updater() {
  const body = await fetchCached(
    "https://www.xainesworld.com/all-refiner-recipes-in-no-mans-sky-origins-3-02/",
    "refining.html"
  );

  const dom = new JSDOM(body);
  const doc = dom.window.document;
  const table = doc.querySelector("table.tablepress tbody");
  const rows = table.querySelectorAll("tr");

  const jsonData = [...rows].map((r) => [...r.children].map((c) => c.textContent));

  const data = parseTableArryToData(jsonData);
  fs.writeFileSync("temps/refining.json", JSON.stringify(data));
  return data;
}

function parseTableArryToData(jsonData) {
  const nodes = new Map();
  const connections = [];

  function createNode(name, value) {
    if (name && !nodes.has(name)) {
      nodes.set(name, {
        name,
        value,
        id: nodes.size,
        image: name.replaceAll(" ", "_").toLowerCase() + ".png",
      });
    }
  }
  function createSource(name, count) {
    if (!nodes.has(name)) {
      createNode(name, "??");
    }
    return { id: nodes.get(name).id, count };
  }

  function createConnection(value, idx) {
    const source = [];
    source.push(createSource(value[3], value[4], idx));
    if (value[5]) {
      source.push(createSource(value[5], value[6], idx));
    }
    if (value[7]) {
      source.push(createSource(value[7], value[8], idx));
    }
    connections.push({
      targetId: nodes.get(value[0]).id,
      count: value[1],
      type: "refining",
      source,
    });
  }

  jsonData.forEach((value, idx) => createNode(value[0], value[2], idx));
  jsonData.forEach(createConnection);

  return { nodes: [...nodes.values()], connections };
}
