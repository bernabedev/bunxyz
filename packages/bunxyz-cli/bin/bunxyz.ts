#!/usr/bin/env bun
// ^ Shebang to indicate it should run with Bun

import chalk from "chalk";
import { Command } from "commander";
import packageJson from "../package.json"; // Import to get the version
import { createProject } from "../src/commands/create.js"; // Important to use .js for post-build compatibility if using tsc
import { generateCrud } from "../src/commands/generate";

const program = new Command();

program
  .name("bunxyz")
  .description(
    chalk.blue.bold(
      "🦊 Bunxyz CLI - The command line tool for the Bunxyz Framework"
    )
  )
  .version(packageJson.version, "-v, --version", "Output the current version");

program
  .command("create <project-name>")
  .description("Create a new Bunxyz project")
  .action(async (projectName) => {
    await createProject(projectName);
  });

const generate = program
  .command("generate")
  .alias("g") // Short alias
  .description("Generate code components for your Bunxyz project");

generate
  .command("crud <resourceName>")
  .description(
    "Generate CRUD API route handlers for a resource (e.g., users, products)"
  )
  .option(
    "-p, --path <relativePath>",
    "Optional path within src/api (e.g., v1/admin)"
  )
  .action(async (resourceName, options) => {
    await generateCrud(resourceName, options);
  });

program.parse(process.argv);

// Handle the case where no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
