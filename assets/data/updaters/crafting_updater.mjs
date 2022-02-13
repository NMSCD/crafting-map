import fs from "fs";
import { hrefs } from "./links.js";
import { fetchAndParseNode } from "./fetchAndParseNode.js";
import { fetchAndParseLiks } from "./fetchAndParseLinks.mjs";

export async function main() {
  const nodes = await fetchAndParseNode(hrefs);
  fs.writeFileSync("./temps/nodes.json", JSON.stringify({ nodes }));

  const hrefs1 = nodes.map((node) => node.href);
  const linking = await fetchAndParseLiks(hrefs1);
  fs.writeFileSync("./temps/linking.json", JSON.stringify({ linking }));

  const newHrefs = new Set([...linking.map((d) => d.possibleNodes).flat(), ...hrefs]);
  fs.writeFileSync("./temps/links.json", JSON.stringify(Array.from(newHrefs)));
}

// await main();
