import { idTemplate, listTemplate } from "./../templates/crud-templates";

import chalk from "chalk";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function lowercase(str: string): string {
  return str.toLowerCase();
}

interface GenerateCrudOptions {
  path?: string;
}

export async function generateCrud(
  resourceName: string,
  options: GenerateCrudOptions
): Promise<void> {
  const lowerResource = lowercase(resourceName);
  const capitalizedResource = capitalize(lowerResource);

  console.log(
    chalk.blue(
      `Generating CRUD API for resource: ${chalk.bold(lowerResource)}...`
    )
  );

  const projectRoot = process.cwd();
  const apiBaseDir = path.join(projectRoot, "src", "api");

  try {
    await stat(apiBaseDir);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.error(
        chalk.red(`Error: Could not find ${chalk.cyan("src/api")} directory.`)
      );
      console.error(
        chalk.yellow("Please run this command from your Bunxyz project root.")
      );
    } else {
      console.error(chalk.red("Error checking src/api directory:"), error);
    }
    process.exit(1);
  }

  const relativePath = options.path
    ? options.path.split("/").filter((p) => p)
    : [];
  const resourceDir = path.join(apiBaseDir, ...relativePath, lowerResource);
  const listFilePath = path.join(resourceDir, "index.ts");
  const idFilePath = path.join(resourceDir, "[id].ts");

  console.log(
    chalk.gray(`  Target directory: ${path.relative(projectRoot, resourceDir)}`)
  );

  try {
    await stat(listFilePath);
    console.error(
      chalk.red(
        `Error: File exists: ${chalk.cyan(
          path.relative(projectRoot, listFilePath)
        )}`
      )
    );
    console.error(
      chalk.yellow("Use a different name or delete existing files first.")
    );
    process.exit(1);
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }

  try {
    await stat(idFilePath);
    console.error(
      chalk.red(
        `Error: File exists: ${chalk.cyan(
          path.relative(projectRoot, idFilePath)
        )}`
      )
    );
    console.error(
      chalk.yellow("Use a different name or delete existing files first.")
    );
    process.exit(1);
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }

  try {
    await mkdir(resourceDir, { recursive: true });
    console.log(
      chalk.gray(
        `  Created directory: ${path.relative(projectRoot, resourceDir)}`
      )
    );
  } catch (error) {
    console.error(chalk.red(`Error creating directory ${resourceDir}:`), error);
    process.exit(1);
  }

  try {
    const listContent = listTemplate(lowerResource, capitalizedResource);
    await writeFile(listFilePath, listContent, "utf-8");
    console.log(
      chalk.green(`  ✓ Created: ${path.relative(projectRoot, listFilePath)}`)
    );

    const idContent = idTemplate(lowerResource, capitalizedResource);
    await writeFile(idFilePath, idContent, "utf-8");
    console.log(
      chalk.green(`  ✓ Created: ${path.relative(projectRoot, idFilePath)}`)
    );

    console.log(
      chalk.green.bold(`\n✨ CRUD API for "${lowerResource}" generated!`)
    );
    console.log(
      chalk.yellow(`\nImplement database logic in the generated files.`)
    );
  } catch (error) {
    console.error(chalk.red(`Error writing files:`), error);
    process.exit(1);
  }
}
