// src/commands/generate.ts
import chalk from "chalk";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createDtoTemplate,
  idTemplateWithDemo,
  listTemplateWithDemo,
  simpleIdTemplate,
  simpleListTemplate,
  updateDtoTemplate,
} from "../templates/crud-templates";

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function lowercase(str: string): string {
  return str.toLowerCase();
}

interface GenerateCrudOptions {
  path?: string;
  demoData?: boolean;
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
  if (options.demoData) {
    console.log(chalk.yellow("  Including demo data and placeholder logic."));
  }

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
  const dtoDir = path.join(resourceDir, "dto");
  const listFilePath = path.join(resourceDir, "index.ts");
  const idFilePath = path.join(resourceDir, "[id].ts");
  const createDtoFilePath = path.join(dtoDir, `create-${lowerResource}.dto.ts`);
  const updateDtoFilePath = path.join(dtoDir, `update-${lowerResource}.dto.ts`);

  console.log(
    chalk.gray(
      `  Target resource directory: ${path.relative(projectRoot, resourceDir)}`
    )
  );
  console.log(
    chalk.gray(
      `  Target DTO directory:      ${path.relative(projectRoot, dtoDir)}`
    )
  );

  const filesToCheck = [
    listFilePath,
    idFilePath,
    createDtoFilePath,
    updateDtoFilePath,
  ];
  for (const filePath of filesToCheck) {
    try {
      await stat(filePath);
      console.error(
        chalk.red(
          `Error: File exists: ${chalk.cyan(
            path.relative(projectRoot, filePath)
          )}`
        )
      );
      console.error(
        chalk.yellow("Use a different name or delete existing files first.")
      );
      process.exit(1);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        console.error(chalk.red(`Error checking file ${filePath}:`), error);
        process.exit(1);
      }
    }
  }

  try {
    await mkdir(resourceDir, { recursive: true });
    await mkdir(dtoDir, { recursive: true });
    console.log(chalk.gray(`  Created directories.`));
  } catch (error) {
    console.error(chalk.red(`Error creating directories:`), error);
    process.exit(1);
  }

  try {
    const listContent = options.demoData
      ? listTemplateWithDemo(lowerResource, capitalizedResource)
      : simpleListTemplate(lowerResource, capitalizedResource);

    const idContent = options.demoData
      ? idTemplateWithDemo(lowerResource, capitalizedResource)
      : simpleIdTemplate(lowerResource, capitalizedResource);

    await writeFile(listFilePath, listContent, "utf-8");
    console.log(
      chalk.green(`  ✓ Created: ${path.relative(projectRoot, listFilePath)}`)
    );

    await writeFile(idFilePath, idContent, "utf-8");
    console.log(
      chalk.green(`  ✓ Created: ${path.relative(projectRoot, idFilePath)}`)
    );

    await writeFile(
      createDtoFilePath,
      createDtoTemplate(lowerResource, capitalizedResource),
      "utf-8"
    );
    console.log(
      chalk.green(
        `  ✓ Created: ${path.relative(projectRoot, createDtoFilePath)}`
      )
    );

    await writeFile(
      updateDtoFilePath,
      updateDtoTemplate(lowerResource, capitalizedResource),
      "utf-8"
    );
    console.log(
      chalk.green(
        `  ✓ Created: ${path.relative(projectRoot, updateDtoFilePath)}`
      )
    );

    console.log(
      chalk.green.bold(`\n✨ CRUD API for "${lowerResource}" generated!`)
    );
    console.log(
      chalk.yellow(
        options.demoData
          ? `\nReview the placeholder logic and adapt it to your requirements.`
          : `\nImplement the API logic and define schemas in the DTO files.`
      )
    );
  } catch (error) {
    console.error(chalk.red(`Error writing files:`), error);
    process.exit(1);
  }
}
