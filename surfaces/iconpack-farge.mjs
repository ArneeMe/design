import { readFileSync } from "node:fs";
import iconpack from "./iconpack.mjs";

export default (t, write) => iconpack(t, write, JSON.parse(readFileSync(new URL("../assets/icon-colors.json", import.meta.url))));
