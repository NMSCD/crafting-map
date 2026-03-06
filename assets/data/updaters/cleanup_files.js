const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const fileData = fs.readFileSync(path.join(__dirname, "../nodes.csv"));
const nodes = parse(fileData, {
  columns: true,
  skip_empty_lines: true,
});

function removeUnusedNodes() {
  const fileData2 = fs.readFileSync(path.join(__dirname, "../connections.csv"));
  const links = parse(fileData2, {
    columns: true,
    skip_empty_lines: true,
  });

  const sources = [...new Set(links.map((l) => [l.Source_1, l.Source_2, l.Source_3]).flat())].filter((a) => !!a);
  const targets = [...new Set(links.map((l) => l.Target))].filter((a) => !!a);

  const toKeep = nodes.filter((n) => sources.includes(n.Name) || targets.includes(n.Name));
  const out = stringify(toKeep, {
    header: true,
  });

  fs.writeFileSync(path.join(__dirname, "../nodes_.csv"), out);
}

function removeUneusedImages() {
  const fileNames = nodes.map((n) => n.Image);
  console.log(fileNames);

  fileNames.forEach((n) => {
    fs.copyFileSync(path.join(__dirname, "..", "..", n), path.join(__dirname, "..", "..", "out", n));
  });
}

// removeUneusedImages();
