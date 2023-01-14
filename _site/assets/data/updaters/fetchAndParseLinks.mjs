import { fetchCached } from "./utils.js";
import { parse } from "node-html-parser";

export async function fetchAndParseLiks(hrefs) {
  const linking = [];
  for (const href of hrefs) {
    console.log("linking...", href);
    linking.push(await fetchLinksData(href));
  }
  return linking;
}

async function fetchLinksData(href) {
  const a = await fetchCached("https://nomanssky.fandom.com" + href, href + ".html");
  const doc = parse(a);

  const componentLinks = [...doc.querySelectorAll("#mw-content-text > div > ul li")].filter((l) =>
    l.textContent.includes("→")
  );

  let possibleNodes = componentLinks
    .map((l) => [...l.querySelectorAll("a")])
    .flat()
    .map((l) => l.href)
    .filter((l) => l?.includes("/wiki"));

  const possibleLinks = componentLinks.map((l) => l.textContent.trim()).map((l) => l.replace(/^.*?  --  /i, ""));

  return { href, possibleLinks, possibleNodes: [...new Set(possibleNodes)] };
}
