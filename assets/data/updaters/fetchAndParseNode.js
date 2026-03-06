const { fetchCached, fetchCachedImg } = require("./utils.js");
const { parse } = require("node-html-parser");

async function fetchAndParseNode(hrefs) {
  const nodes = [];

  for (const href of hrefs) {
    const node = await fetchNodeDataWithImage(href);
    console.log("fetching...", href);
    if (!node) {
      console.error("skipped", href);
      continue;
    }
    if (
      node.type?.includes("Decoration") ||
      node.type?.includes("Unlockable Helmet") ||
      node.type?.includes("Raw Ingredient") ||
      node.type?.includes("Edible Product") ||
      node.type?.includes("Carnivore Bait") ||
      node.type?.includes("Herbivore Bait") ||
      node.type?.includes("Hyperdrive") ||
      node.type?.includes("Submarine") ||
      node.type?.includes("Starship") ||
      node.type?.includes("Freighter") ||
      node.type?.includes("Exocraft") ||
      node.category?.includes("Base Building") ||
      node.category?.includes("Exosuit") ||
      (node.category?.includes("Technology") && node.type != "Salvaged Technology") ||
      node.category?.includes("Submarine") ||
      node.category?.includes("Customisation") ||
      node.category?.includes("Multi-tool") ||
      node.category?.includes("Weapon") ||
      node.category?.includes("Freighter") ||
      node.category?.includes("Curiosity") ||
      node.category?.includes("Ship - Utilities") ||
      node.category?.includes("Exocraft") ||
      node.category?.includes("Starship") ||
      node.category?.includes("Ship") ||
      node.category?.includes("Vehicle") ||
      node.name?.includes("Weatherproof Rubber") ||
      node.name?.includes("Radiant Brain")
    ) {
      continue;
    }
    node.href = href;

    await fetchImages(href);

    nodes.push(node);
  }

  return nodes;
}

function parser(a) {
  const doc = parse(a);

  const table = doc.querySelector("#mw-content-text table.infoboxtable");
  if (!table) {
    return {};
  }
  const name = table.querySelector("th.infoboxname").textContent.trim();
  const linkImg = table.querySelector("tr:nth-child(2) a");
  const imageHref = linkImg ? linkImg.getAttribute("href") : undefined;
  let rows = [...table.querySelectorAll("tr")]
    .map((t) => t.textContent)
    .map((r) =>
      r
        .replaceAll(" ", " ")
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c)
    )
    .filter((r) => r.length === 2);

  function findValueInTable(rows, name) {
    const find = rows.find((text) => text[0].includes(name));
    return find ? find[1] : "??";
  }

  const category = findValueInTable(rows, "Category");
  const type = findValueInTable(rows, "Type");
  let value = findValueInTable(rows, "Total Value");
  if (value === "??") {
    value = findValueInTable(rows, "Value");
  }
  return { name, imageHref, category, type, value };
}

async function fetchNodeDataWithImage(href) {
  const a = await fetchCached("https://nomanssky.fandom.com" + href, href + ".html");

  const { name, category, type, value } = parser(a);

  if (!name) {
    return;
  }

  const number = Number(value?.replaceAll(",", ""));
  return {
    name,
    category,
    type,
    value: isNaN(number) ? "??" : number,
    image: name?.toLowerCase().replaceAll(" ", "_") + ".png",
  };
}

async function fetchImages(href) {
  const a = await fetchCached("https://nomanssky.fandom.com" + href, href + ".html");

  const { name, imageHref } = parser(a);

  if (imageHref) {
    await fetchCachedImg(imageHref, `${name}.png`);
  } else {
    throw new Error("missing image");
  }
}

module.exports = {
  fetchAndParseNode: fetchAndParseNode,
  fetchImages: fetchImages,
};
