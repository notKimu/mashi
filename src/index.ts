import { askConfiguration } from "./handler/asking.js";
import {
  askEulaAccept,
  askServerPath,
  setServerProperties,
} from "./handler/configuration.js";
import { downloadServer } from "./handler/downloading.js";
import { askYesOrNo } from "./handler/utils.js";

console.log("    /)＿/)☆");
console.log(" ／(๑^᎑^๑)っ ＼   Mashi Assistant");
console.log("|    ∪  ∪  |＼／  | Alpha v0.1");
console.log("| ＿＿_＿＿|／");
console.log("");

(async () => {
  const serverPath = await askServerPath();
  const config = await askConfiguration();

  const successfullyDownloadedServer = await downloadServer(config, serverPath);
  if (!successfullyDownloadedServer) {
    console.log("Error downloading the server, try again");
    return;
  }

  const shouldCustomizeServerProperties = await askYesOrNo(
    "Customize server properties?"
  );
  await setServerProperties(shouldCustomizeServerProperties, serverPath);

  await askEulaAccept(serverPath);
})();
