You are helping build a pet database for the mobile game SOULS by Habby.
I'm attaching screenshots of a pet's skill screens.
Extract all visible skill data and return only a valid JSON array — no markdown, no explanation, no code blocks, no backticks.

The JSON must match this exact structure (array of skill objects):
[
  {
    "id": "petname_first_skill_name",
    "type": "active",
    "name": "Active Skill Name",
    "description": "Full active skill description copied from the screenshot exactly."
  },
  {
    "id": "petname_second_skill_name",
    "type": "passive",
    "name": "Passive Skill Name",
    "description": "Full passive skill description copied from the screenshot exactly."
  }
]

Rules:

- Determine the pet's name from the screenshots and use it (lowercase, underscores) as the prefix for every skill id. Build ids from the pet's name and the actual skill name: "petname_skillname_lowercase_underscores". Do not add the skill type unless it is part of the skill's name.
- Copy skill descriptions exactly as shown in the screenshot — do not paraphrase or translate. Preserve all numbers, percentages, durations, conditions, and limits.
- Use the real skill name from the screenshot — never use placeholder text.
- Include only these fields for each skill: `id`, `type`, `name`, `description`. Do not include `tags` or pet-level fields such as `imageUrl`.
- Skills must appear in this exact order:
  1. active (1 skill)
  2. passive (1 skill)
- Do not include hero-only skill types: awaken, engraving, or exclusive-equipment.
- If a skill has multiple levels, use the description from the highest level shown. Include any unchanged description text needed to preserve the full effect at that level; do not infer unseen upgrades.
- Do not invent missing or unreadable skill data. If the pet's name, either skill's name, type, or full description cannot be determined from the screenshots, return an empty JSON array `[]`.
