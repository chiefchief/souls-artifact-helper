#!/usr/bin/env node
/**
 * Parses the alliance "Hero total overview" CSV export into per-hero
 * skills arrays matching the SOULS artifact helper schema.
 *
 * Usage:
 *   node parse-skills.mjs <input.csv> [outputDir]
 *
 * Expected columns (0-indexed) based on the sheet header row:
 *   E  (4)  Name
 *   X  (23) Active Skill
 *   Y  (24) Passive skill 1
 *   Z  (25) Passive skill 2
 *   AA (26) Passive skill 3
 *   AB (27) Awaken Skill
 *   AC (28) Engraving
 *   AD (29) Exclusive equipment
 *
 * If your sheet's columns differ, adjust COLUMN_MAP below.
 */

import fs from "node:fs";
import path from "node:path";

const COLUMN_MAP = {
  name: 4,
  active: 23,
  passive1: 24,
  passive2: 25,
  passive3: 26,
  awaken: 27,
  engraving: 28,
  exclusiveEquipment: 29,
};

const SKILL_TYPE_BY_KEY = {
  active: "active",
  passive1: "passive",
  passive2: "passive",
  passive3: "passive",
  awaken: "awaken",
  engraving: "engraving",
  exclusiveEquipment: "exclusive-equipment",
};

// Order matters — must match the project's required skill order.
const SKILL_KEY_ORDER = ["active", "passive1", "passive2", "passive3", "awaken", "engraving", "exclusiveEquipment"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // skip, \n will follow
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function splitNameAndDescription(cell) {
  const idx = cell.indexOf(":");
  if (idx === -1) {
    return { name: cell.trim(), description: cell.trim() };
  }
  return {
    name: cell.slice(0, idx).trim(),
    description: cell.slice(idx + 1).trim(),
  };
}

function buildHeroSkills(row, heroId) {
  const skills = [];

  for (const key of SKILL_KEY_ORDER) {
    const cellIndex = COLUMN_MAP[key];
    const raw = (row[cellIndex] || "").trim();
    if (!raw) continue; // e.g. no exclusive equipment for this hero

    const hasName = key !== "engraving";
    const { name, description } = hasName ? splitNameAndDescription(raw) : { name: "", description: raw.trim() };
    const skillSlug = hasName ? slugify(name) : "engraving";

    skills.push({
      id: `${heroId}_${skillSlug}`,
      type: SKILL_TYPE_BY_KEY[key],
      name,
      description,
      tags: [],
    });
  }

  return skills;
}

function main() {
  const [, , inputPath, outputDirArg] = process.argv;

  if (!inputPath) {
    console.error("Usage: node parse-skills.mjs <input.csv> [outputDir]");
    process.exit(1);
  }

  const outputDir = outputDirArg || "./skills-output";
  fs.mkdirSync(outputDir, { recursive: true });

  const csvText = fs.readFileSync(inputPath, "utf-8");
  const rows = parseCsv(csvText);

  // Row 0 = header row 1 (Race, Class, Name...), row 1 = second header row (ATK, DEF...)
  // Data starts at row 2 based on the sheet structure shown.
  const dataRows = rows.slice(2).filter((r) => (r[COLUMN_MAP.name] || "").trim());

  const summary = [];
  const combined = {};

  for (const row of dataRows) {
    const heroName = row[COLUMN_MAP.name].trim();
    const heroId = slugify(heroName);
    const skills = buildHeroSkills(row, heroId);

    if (skills.length === 0) {
      summary.push({ heroId, heroName, status: "NO_SKILLS_FOUND" });
      continue;
    }

    combined[heroId] = skills;
    fs.writeFileSync(path.join(outputDir, `${heroId}.json`), JSON.stringify(skills, null, 2), "utf-8");
    summary.push({ heroId, heroName, skillCount: skills.length, status: "OK" });
  }

  fs.writeFileSync(path.join(outputDir, "_all-heroes.json"), JSON.stringify(combined, null, 2), "utf-8");

  console.log(`Parsed ${summary.length} heroes.`);
  const problems = summary.filter((s) => s.status !== "OK");
  if (problems.length) {
    console.log("\nHeroes needing attention:");
    for (const p of problems) console.log(`  - ${p.heroName} (${p.heroId}): ${p.status}`);
  }
  console.log(`\nOutput written to ${path.resolve(outputDir)}`);
  console.log(`- One JSON file per hero (e.g. sol.json)`);
  console.log(`- _all-heroes.json with everything combined`);
}

main();
