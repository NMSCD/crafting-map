import { schemeCategory10 } from "https://cdn.skypack.dev/d3-scale-chromatic@3";

export const linkColorNum = 10;
export function linkColorProvider(id) {
  return schemeCategory10[id % linkColorNum];
}
