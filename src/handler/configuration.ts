import inquirer from "inquirer";
import { serverProperties } from "../files/server-properties.js";
import { existsSync, writeFileSync } from "fs";
import path from "node:path";

export async function askServerPath(): Promise<string> {
  let serverPath = "";
  let isValidPath = false;

  while (!isValidPath) {
    await inquirer
      .prompt([
        {
          type: "input",
          name: "path",
          message: "Input the server path:",
        },
      ])
      .then((input) => {
        if (existsSync(input.path)) {
          serverPath = input.path;
          isValidPath = true;
        }
      });
  };

  return serverPath;
}

export async function setServerProperties(customize: boolean, serverPath: string) {
  let defaultServerProperties = serverProperties;

  if (customize) {
    const customServerProperties = await inquirer.prompt([
      {
        type: "number",
        name: "server-port",
        message: "Server Port:",
      },
      {
        type: "confirm",
        name: "online-mode",
        message: "Online mode:",
      },
      {
        type: "number",
        name: "max-players",
        message: "Max players:",
      },
      {
        type: "list",
        name: "difficulty",
        message: "Server difficulty:",
        choices: ["peaceful", "easy", "normal", "hard"],
      },
    ]);

    Object.keys(customServerProperties).forEach((property) => {
      (defaultServerProperties as any)[property] = (
        customServerProperties as any
      )[property];
    });
  }

  let formattedProperties = "";
  Object.keys(defaultServerProperties).map((key, index) => {
    formattedProperties += `${key}=${
      Object.values(defaultServerProperties)[index]
    }\n`;
  });

  const file = path.join(serverPath, "server.properties");
  writeFileSync(file, formattedProperties);
}

export async function openServerPropertiesEditor() {
  const shouldOpenEditor = await inquirer.prompt([
    {
      type: "confirm",
      name: "open_editor",
      message: "Open the text editor to view the file?",
    },
  ]);

  if (!shouldOpenEditor.open_editor) return;
}

export async function askEulaAccept(serverPath: string) {
  const doesUseracceptsEula = await inquirer.prompt([
    {
      type: "confirm",
      name: "eula",
      message: "Do you accept the EULA?",
    },
  ]);

  let acceptsEula = doesUseracceptsEula.eula ? true : false;

  const file = path.join(serverPath, "eula.txt");
  writeFileSync(file, `eula=${acceptsEula}`);
}
