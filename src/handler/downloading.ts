import cliSpinners from "cli-spinners";
import { finished } from "stream/promises";
import fs from "fs";
import ora from "ora";
import {
  PaperBuildsAPI,
  PurpurBuildsAPI,
  ServerConfigurationDTO,
} from "../dto";
import path from "path";
import { Readable } from "stream";

interface ServerDownloadData {
  file: string;
  download: string;
}

const serverEngineMap = {
  Bukkit: {
    file: "craftbukkit-{version}.jar",
    download: "https://download.getbukkit.org/craftbukkit/",
  },
  Paper: {
    file: "",
    download:
      "https://api.papermc.io/v2/projects/paper/versions/{version}/builds/{build}/downloads/",
  },
  Purpur: {
    file: "",
    download: "https://api.purpurmc.org/v2/purpur/{version}/{build}/download",
  },
  Spigot: {
    file: "spigot-{version}.jar",
    download: "https://download.getbukkit.org/spigot/",
  },
  Vanilla: {
    file: "vanilla-{version}.jar",
    download: "https://www.mcjars.com/get/",
  },
};

export async function downloadServer(
  serverConfig: ServerConfigurationDTO,
  serverPath: string
): Promise<boolean> {
  let downloadInfo = serverEngineMap[serverConfig.engine];
  downloadInfo.file = downloadInfo.file.replace(
    "{version}",
    serverConfig.version
  );

  // Dirty dumb checks
  if (serverConfig.engine === "Bukkit" || serverConfig.engine === "Spigot") {
    downloadInfo = getBukkitInfo(serverConfig.engine, serverConfig);
  } else if (serverConfig.engine === "Paper") {
    const paperData = await getPaperInfo(serverConfig);
    if (!paperData) return false;

    downloadInfo = paperData;
  } else if (serverConfig.engine === "Purpur") {
    const purpurData = await getPurpurInfo(serverConfig);
    if (!purpurData) return false;

    downloadInfo = purpurData;
  }

  console.log("");
  console.log(`${serverConfig.engine} >>= ${serverConfig.version}`);
  console.log(`| File: ${downloadInfo.file}`);

  // Server file download
  const throbber = ora({
    discardStdin: false,
    text: `Downloading ${downloadInfo.file}`,
    spinner: cliSpinners.binary,
  }).start();

  const serverFileRequest = await fetch(
    downloadInfo.download +
      (serverConfig.engine === "Purpur" ? "" : downloadInfo.file)
  );
  if (!serverFileRequest.ok || !serverFileRequest.body) {
    throbber.fail();

    const errorMessage = await serverFileRequest.text();
    console.error(serverFileRequest.status + " | " + errorMessage);

    return false;
  }

  // Save the file
  const downloadPath = path.join(serverPath, downloadInfo.file);
  const body = Readable.fromWeb(
    serverFileRequest.body as unknown as import("stream/web").ReadableStream<any>
  );
  const download_write_stream = fs.createWriteStream(downloadPath);
  await finished(body.pipe(download_write_stream));
  throbber.succeed();

  console.log(`! Saved ${downloadInfo.file} into ${downloadPath}`);
  console.log("");

  return true;
}

function getBukkitInfo(
  engine: "Bukkit" | "Spigot",
  config: ServerConfigurationDTO
): ServerDownloadData {
  const jarPrefix = engine === "Bukkit" ? "craftbukkit" : "spigot";
  const fileName = `${jarPrefix}-${config.version}.jar`;
  const versionNumber = parseInt(config.version.split(".")[1]);
  const downloadURI =
    versionNumber >= 17
      ? `https://download.getbukkit.org/${jarPrefix}/`
      : `https://cdn.getbukkit.org/${jarPrefix}/`;

  return {
    file: fileName,
    download: downloadURI,
  };
}

async function getPaperInfo(
  config: ServerConfigurationDTO
): Promise<ServerDownloadData | null> {
  const buildListRequest = await fetch(
    `https://api.papermc.io/v2/projects/paper/versions/${config.version}/builds/`
  );
  if (!buildListRequest.ok) {
    const errorJson = JSON.parse(await buildListRequest.text());
    console.log(buildListRequest.status + " | " + errorJson.error);

    return null;
  }

  const buildList: PaperBuildsAPI = await buildListRequest.json();
  const latestBuild = buildList.builds[buildList.builds.length - 1];

  const serverData: ServerDownloadData = {
    file: latestBuild.downloads.application.name,
    download: serverEngineMap.Paper.download
      .replace("{build}", latestBuild.build.toString())
      .replace("{version}", config.version),
  };
  return serverData;
}

async function getPurpurInfo(
  config: ServerConfigurationDTO
): Promise<ServerDownloadData | null> {
  const buildListRequest = await fetch(
    "https://api.purpurmc.org/v2/purpur/" + config.version
  );
  if (!buildListRequest.ok) {
    const errorJson = JSON.parse(await buildListRequest.text());
    console.log(buildListRequest.status + " | " + errorJson.error);

    return null;
  }

  const buildList: PurpurBuildsAPI = await buildListRequest.json();
  const latestBuild = buildList.builds.all[buildList.builds.all.length - 1];

  const serverData: ServerDownloadData = {
    file: `purpur-${config.version}-${latestBuild}.jar`,
    download: serverEngineMap.Purpur.download
      .replace("{build}", latestBuild)
      .replace("{version}", config.version),
  };

  return serverData;
}
