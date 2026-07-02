You are helping build a hero database for the mobile game SOULS by Habby.
I'm attaching screenshots of a hero's skill screens.
Extract all visible skill data and return only a valid JSON array — no markdown, no explanation, no code blocks, no backticks.

The JSON must match this exact structure (array of skill objects):
[
{
"id": "heroname_skillname_lowercase_underscores",
"type": "active" | "passive" | "awaken" | "engraving" | "exclusive-equipment",
"name": "Skill Name",
"description": "Full skill description copied from the screenshot exactly.",
"tags": []
}
]

Rules:

- Determine the hero's name from the screenshots and use it (lowercase, underscores) as the prefix for every skill id — e.g. "sol_spirits_roar"
- Copy skill descriptions exactly as shown in the screenshot — do not paraphrase
- Use the real skill name from the screenshot — never use placeholder text
- The engraving skill has no name on screen — always use id "heroname_engraving" and set "name" to "Heroname's Engraving" (e.g. "richelle_engraving" / "Richelle's Engraving")
- Leave `tags` as an empty array `[]` for all skills
- Skills must appear in this exact order:
  1. active (1 skill)
  2. passive (3 skills, in the order they appear in game)
  3. awaken (1 skill)
  4. engraving (1 skill)
  5. exclusive-equipment (1 skill, only if it exists)
- If a skill has multiple levels (1/2/3/4/5), use the description from the highest level shown
