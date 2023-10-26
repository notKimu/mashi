import inquirer from "inquirer";

interface ConfirmationQuery {
  response: boolean;
}

export async function askYesOrNo(question: string): Promise<boolean> {
  const confirmation: ConfirmationQuery = await inquirer.prompt([
    {
      type: "confirm",
      name: "response",
      message: question,
    },
  ]);

  return confirmation.response;
}
