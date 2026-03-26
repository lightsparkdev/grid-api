import Grid from "@lightsparkdev/grid";
import { config } from "./config.js";

export const gridClient = new Grid({
  username: config.apiTokenId,
  password: config.apiClientSecret,
});
