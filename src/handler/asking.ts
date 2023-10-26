import inquirer from "inquirer";
import { ServerConfigurationDTO } from "../dto";

export async function askConfiguration(): Promise<ServerConfigurationDTO> {
  return await inquirer.prompt([
    {
      type: "list",
      name: "engine",
      message: "Choose a server engine:",
      choices: [
        "Vanilla",
        new inquirer.Separator(),
        "Paper",
        "Purpur",
        "Bukkit",
        "Spigot",
        {
          name: "Pufferfish",
          disabled: "Not implemented",
        },
        new inquirer.Separator(),
        {
          name: "Forge",
          disabled: "Not implemented",
        },
        {
          name: "Fabric",
          disabled: "Not implemented",
        },
        new inquirer.Separator()
      ],
    },
    {
      type: "input",
      name: "version",
      message: "What version do you want?",
    },
  ]);
}
