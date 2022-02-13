const path = require("path");
const fs = require("fs");

function nodes() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data.json")));
  const nodes = data.nodes;
  let csv = "Name,Category,Type,Value,Image,Link\n";
  csv += nodes.map((n) => [n.name, n.category, n.type, n.value, n.image, n.href]).join("\n");
  fs.writeFileSync(path.join(__dirname, "../nodes.csv"), csv);
}

function links() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data.json")));
  const nodes = new Map();
  data.nodes.forEach((n) => nodes.set(n.id, n));
  const connections = data.connections;

  let csv = "Target,TargetCount,Type,Source_1,Count_1,Source_2,Count_2,Source_3,Count_3\n";
  csv += connections
    .map((c) => {
      const newVar = [c.target, c.count, c.type];
      for (let i = 0; i < 3; i++) {
        const s = c.source[i] || {};
        newVar.push(nodes.get(s.id)?.name || "", s.count || "");
      }
      return newVar;
    })
    .join("\n");
  fs.writeFileSync(path.join(__dirname, "../connections.csv"), csv);
}

exports.jsonToCsv = function () {
  nodes();
  links();
};
