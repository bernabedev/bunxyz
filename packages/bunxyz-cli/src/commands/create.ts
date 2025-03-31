import chalk from "chalk"; // For colored output
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Helper to get the current directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the CLI root path (assuming structure src/commands)
const packageRoot = path.resolve(__dirname, "..", "..", "..");
const templateDir = path.join(packageRoot, "src", "templates", "default");

// Recursive function to copy directories
async function copyDirRecursive(
  src: string,
  dest: string,
  projectName: string
): Promise<void> {
  try {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDirRecursive(srcPath, destPath, projectName);
      } else {
        if (entry.name === "package.json") {
          // Read, modify, and write package.json
          const content = await readFile(srcPath, "utf-8");
          const modifiedContent = content.replace(
            "{{projectName}}",
            projectName
          );
          await writeFile(destPath, modifiedContent, "utf-8");
        } else {
          // Directly copy other files
          await copyFile(srcPath, destPath);
        }
      }
    }
  } catch (error: any) {
    console.error(
      chalk.red(`Error copying directory ${src} to ${dest}:`),
      error
    );
    throw error; // Rethrow to stop the process
  }
}

export async function createProject(projectName: string): Promise<void> {
  if (!projectName) {
    console.error(chalk.red("Error: Project name is required."));
    console.log(chalk.yellow("Usage: bunxyz create <project-name>"));
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), projectName);
  console.log(chalk.blue(`Creating new Bunxyz project in ${targetDir}...`));

  try {
    // Check if the directory already exists
    await stat(targetDir);
    console.error(
      chalk.red(`Error: Directory "${projectName}" already exists.`)
    );
    process.exit(1);
  } catch (error: any) {
    // If the error is ENOENT (does not exist), it’s fine, we can proceed.
    if (error.code !== "ENOENT") {
      console.error(chalk.red("An unexpected error occurred:"), error);
      process.exit(1);
    }
  }

  try {
    // Create the directory and copy the template
    console.log(chalk.cyan("  Copying template files..."));
    await copyDirRecursive(templateDir, targetDir, projectName);

    console.log(
      chalk.green.bold(`\n✨ Project "${projectName}" created successfully!`)
    );
    console.log(chalk.yellow("\nNext steps:"));
    console.log(`  1. ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  2. ${chalk.cyan("bun install")}`);
    console.log(
      `  3. ${chalk.cyan("bun dev")} (to start the development server)`
    );
  } catch (error) {
    console.error(
      chalk.red("\nFailed to create project. Please check the errors above.")
    );
    // Optionally, try to clean up the created directory if the process failed midway
    // await rm(targetDir, { recursive: true, force: true }).catch(() => {});
    process.exit(1);
  }
}
