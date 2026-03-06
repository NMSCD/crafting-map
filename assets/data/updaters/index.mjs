import { main as itemUpdater } from "./crafting_updater.mjs";
import { main as dataBundler } from "./data_bundler.mjs";
import { main as renamer } from "./renamer.js";
import { jsonToCsv } from "./json_to_csv.js";

await itemUpdater();
dataBundler();
renamer();
jsonToCsv();
