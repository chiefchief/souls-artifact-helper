#!/usr/bin/env node
/**
 * Injects parsed skill arrays (from parse-skills.mjs output) into existing
 * src/heroes/{race}/{heroId}/skills.ts files, replacing `skills: [`
 * in place. Leaves every other field (id, name, rarity, race, role,
 * attribute, imageUrl) untouched.
 *
 * Usage:
 *   node update-hero-skills.mjs <skillsJsonDir> <heroesRootDir>
 *
 * Example:
 *   node update-hero-skills.mjs ./skills-output ./src/heroes
 *
 * By default this refuses to touch a file whose `skills:` array is not
 * empty (to avoid clobbering manually-added data). Pass --force to
 * overwrite non-empty arrays too.
 */

import fs from "node:fs";
import path from "node:path";

function findSkillsFile(heroesRoot, heroId) {
  const races = fs
    .readdirSync(heroesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const race of races) {
    const candidate = path.join(heroesRoot, race, heroId, "skills.ts");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function escapeTsString(str) {
  // Reuse JSON.stringify for correct escaping, it produces valid double-quoted JS/TS strings.
  return JSON.stringify(str);
}

function formatSkillsArray(skills) {
  if (skills.length === 0) return "[]";

  const items = skills.map((skill) => {
    return [
      "    {",
      `      id: ${escapeTsString(skill.id)},`,
      `      type: ${escapeTsString(skill.type)},`,
      `      name: ${escapeTsString(skill.name)},`,
      `      description: ${escapeTsString(skill.description)},`,
      `      tags: [],`,
      "    },",
    ].join("\n");
  });

  return `[\n${items.join("\n")}\n  ]`;
}

function main() {
  const [, , skillsJsonDir, heroesRootArg] = process.argv;
  const force = process.argv.includes("--force");

  if (!skillsJsonDir || !heroesRootArg) {
    console.error("Usage: node update-hero-skills.mjs <skillsJsonDir> <heroesRootDir> [--force]");
    process.exit(1);
  }

  const heroesRoot = path.resolve(heroesRootArg);
  const files = fs.readdirSync(skillsJsonDir).filter((f) => f.endsWith(".json") && f !== "_all-heroes.json");

  const results = { updated: [], skippedNotFound: [], skippedNotEmpty: [], errors: [] };

  for (const file of files) {
    const heroId = file.replace(/\.json$/, "");
    const jsonPath = path.join(skillsJsonDir, file);

    let skills;
    try {
      skills = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } catch (err) {
      results.errors.push(`${heroId}: failed to parse JSON (${err.message})`);
      continue;
    }

    const skillsFilePath = findSkillsFile(heroesRoot, heroId);
    if (!skillsFilePath) {
      results.skippedNotFound.push(heroId);
      continue;
    }

    const content = fs.readFileSync(skillsFilePath, "utf-8");
    const emptyPattern = /skills:\s*\[\s*\]/;

    if (!emptyPattern.test(content)) {
      if (!force) {
        results.skippedNotEmpty.push(heroId);
        continue;
      }
      // With --force, replace any skills: [ ... ] block (non-greedy, single occurrence expected)
      const nonEmptyPattern = /skills:\s*\[[\s\S]*?\n(\s*)\]/;
      if (!nonEmptyPattern.test(content)) {
        results.errors.push(`${heroId}: could not locate a skills: [...] block to replace`);
        continue;
      }
      const updated = content.replace(nonEmptyPattern, `skills: ${formatSkillsArray(skills)}`);
      fs.writeFileSync(skillsFilePath, updated, "utf-8");
      results.updated.push(heroId);
      continue;
    }

    const updated = content.replace(emptyPattern, `skills: ${formatSkillsArray(skills)}`);
    fs.writeFileSync(skillsFilePath, updated, "utf-8");
    results.updated.push(heroId);
  }

  console.log(`Updated: ${results.updated.length}`);
  if (results.updated.length) console.log("  " + results.updated.join(", "));

  if (results.skippedNotFound.length) {
    console.log(`\nNo skills.ts found for (${results.skippedNotFound.length}):`);
    console.log("  " + results.skippedNotFound.join(", "));
  }

  if (results.skippedNotEmpty.length) {
    console.log(`\nSkipped, already has skills (use --force to overwrite) (${results.skippedNotEmpty.length}):`);
    console.log("  " + results.skippedNotEmpty.join(", "));
  }

  if (results.errors.length) {
    console.log(`\nErrors (${results.errors.length}):`);
    console.log("  " + results.errors.join("\n  "));
  }
}

main();
