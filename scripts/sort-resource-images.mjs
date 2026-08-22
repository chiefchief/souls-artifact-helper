#!/usr/bin/env node

import { access, mkdir, readdir, realpath, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import AdmZip from "adm-zip";
import { cac } from "cac";

const IMAGE_EXTENSIONS = new Set([".avif", ".bmp", ".gif", ".jpeg", ".jpg", ".png", ".tga", ".webp"]);
// Add root-level resource folder names here when they should be removed with
// the --delete-folders flag after images have been sorted.
const FOLDERS_TO_DELETE = [
  "Areba",
  "Arena",
  "artifact",
  "autoreward",
  "BG",
  "btn",
  "button",
  "Cave",
  "cave2",
  "character",
  "chat",
  "community",
  "contents",
  "contetns",
  "daily",
  "dimension",
  "endless",
  // // // //
  "event",
  "FX",
  "gachaup",
  "go",
  "growth",
  "guild",
  "guildboss",
  "habbyid",
  "habbylogo",
  "heritage",
  "intro",
  "login",
  "mail",
  "mastery",
  "mission",
  "new",
  "novice",
  "npc",
  "Pass",
  "pixel",
  "Pngtree",
  "pressbox",
  "profile",
  "ptn",
  "ranking",
  "review",
  "run",
  "season",
  "seasonboard",
  "seasonboss",
  "seasonshop",
  "Setting",
  "skill",
  "Sprite",
  "stage",
  "tab3",
  "Tile",
  "timereward",
  "title",
  "titlemap",
  "ui",
  "VFX",
  "vip",
  "weekly",
  "tutorial",
  "talent",
  // "IconSeal",
  // "IconHeritage",
  // "heritage",
  // "habbylogo",
  // "habbyid",
  // "guildboss",
  // "guild",
  // "growth",
  // "go",
  // "gachaup",
  // "exploration",
  // "event", // may be useful
  // "daily",
  // "contetns",
  // "character",
  // "cave2",
  // "Cave",
  // "button",
  // "btn",
  // "BG",
  // "autoreward",
  // "dimension",
  // "artifact",
];

const cli = cac("sort-resource-images");

cli
  .usage("<resource-directory-or-zip>")
  .option("--delete-folders", "Delete configured root-level folders after sorting")
  .example('yarn resources:sort-images "resources/4.3.0/[4.3.0] Sprites/Sprite"')
  .example('yarn resources:sort-images "resources/4.3.0/[4.3.0] Sprites/Sprite" --delete-folders')
  .example('yarn resources:sort-images "game_resources/4.3.0/[4.3.0] Sprites.zip" --delete-folders')
  .help();

cli.parse();

if (cli.options.help) {
  process.exit(0);
}

let [resourceDirectory] = cli.args;
let { deleteFolders } = cli.options;

// CAC treats the value after a dashed boolean flag as that flag's value when
// the flag appears before a positional argument. Normalize that form too.
if (!resourceDirectory && typeof deleteFolders === "string") {
  resourceDirectory = deleteFolders;
  deleteFolders = true;
}

if (!resourceDirectory || cli.args.length > 1) {
  console.error("Provide exactly one resource directory or ZIP archive.");
  cli.outputHelp();
  process.exit(1);
}

async function directoryForInput(inputPath) {
  const resolvedInputPath = path.resolve(inputPath);
  let inputStats;

  try {
    inputStats = await stat(resolvedInputPath);
  } catch {
    console.error(`Path does not exist or is unavailable: ${resolvedInputPath}`);
    process.exit(1);
  }

  if (inputStats.isDirectory()) {
    return resolvedInputPath;
  }

  if (!inputStats.isFile() || path.extname(resolvedInputPath).toLowerCase() !== ".zip") {
    console.error(`Expected a directory or .zip archive: ${resolvedInputPath}`);
    process.exit(1);
  }

  const extractionDirectory = path.join(
    path.dirname(resolvedInputPath),
    path.basename(resolvedInputPath, path.extname(resolvedInputPath)),
  );

  try {
    await access(extractionDirectory);
    console.error(`Extraction directory already exists: ${extractionDirectory}`);
    process.exit(1);
  } catch {
    // The destination must not exist, so extraction never mixes with old files.
  }

  const archive = new AdmZip(resolvedInputPath);
  const safeExtractionRoot = `${path.resolve(extractionDirectory)}${path.sep}`;
  const unsafeEntry = archive.getEntries().find((entry) => {
    const entryPath = path.resolve(extractionDirectory, entry.entryName.replaceAll("\\", "/"));
    return !entryPath.startsWith(safeExtractionRoot);
  });

  if (unsafeEntry) {
    console.error(`Archive contains an unsafe entry path: ${unsafeEntry.entryName}`);
    process.exit(1);
  }

  await mkdir(extractionDirectory);
  archive.extractAllTo(extractionDirectory, false);
  console.log(`Extracted archive to: ${extractionDirectory}`);
  return extractionDirectory;
}

const rootDirectory = await directoryForInput(resourceDirectory);

async function findImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      images.push(...(await findImages(entryPath)));
    } else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      images.push(entryPath);
    }
  }

  return images;
}

function folderForImage(imagePath) {
  const baseName = path.basename(imagePath, path.extname(imagePath));
  const parts = baseName.split("_");
  const prefix = parts[0];
  return parts.length > 1 && prefix.length > 1 ? prefix : "random";
}

async function uniqueDestination(destination) {
  const parsed = path.parse(destination);
  let candidate = destination;
  let counter = 2;

  while (true) {
    try {
      await access(candidate);
      candidate = path.join(parsed.dir, `${parsed.name}-${counter}${parsed.ext}`);
      counter += 1;
    } catch {
      return candidate;
    }
  }
}

async function isSameFile(firstPath, secondPath) {
  try {
    return (await realpath(firstPath)) === (await realpath(secondPath));
  } catch {
    return false;
  }
}

const images = await findImages(rootDirectory);
let moved = 0;
let skipped = 0;

for (const imagePath of images) {
  const targetDirectory = path.join(rootDirectory, folderForImage(imagePath));
  const intendedDestination = path.join(targetDirectory, path.basename(imagePath));

  await mkdir(targetDirectory, { recursive: true });

  if (imagePath === intendedDestination || (await isSameFile(imagePath, intendedDestination))) {
    skipped += 1;
    continue;
  }

  const destination = await uniqueDestination(intendedDestination);
  await rename(imagePath, destination);
  moved += 1;
}

let deleted = 0;

if (deleteFolders) {
  const rootEntries = await readdir(rootDirectory, { withFileTypes: true });

  for (const entry of rootEntries) {
    if (entry.isDirectory() && FOLDERS_TO_DELETE.includes(entry.name)) {
      await rm(path.join(rootDirectory, entry.name), { recursive: true, force: true });
      deleted += 1;
    }
  }
}

console.log(`Done: moved ${moved} image(s); skipped ${skipped} already sorted image(s); deleted ${deleted} folder(s).`);
