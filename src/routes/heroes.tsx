import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeQuestionMark, Gem, Search, Shield, Sparkles, Sword, X, Zap } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  heroes,
  type Hero,
  type HeroAttribute,
  type HeroRace,
  type HeroRole,
  type Skill,
  type SkillTag,
  type SkillType,
} from "../heroes/heroes";

export const Route = createFileRoute("/heroes")({
  component: HeroesPage,
});

type FilterValue<T extends string> = "all" | T;
type SkillSlot = {
  label: string;
  missingLabel: string;
  type: SkillType;
};
type TooltipPlacement = "top" | "bottom";
type TooltipState = {
  left: number;
  maxHeight: number;
  placement: TooltipPlacement;
  top: number;
};
type SkillTagGroup = {
  color: string;
  label: string;
  tags: SkillTag[];
};
type SkillTagMeta = {
  label: string;
};

const allHeroes = heroes as Hero[];
const races: HeroRace[] = ["human", "horde", "elf", "undead", "light", "darkness"];
const roles: HeroRole[] = ["tanker", "dealer", "supporter", "healer"];
const attributes: HeroAttribute[] = ["strength", "agility", "intelligence"];
const raceTheme: Record<HeroRace, string> = {
  darkness: "#a77cff",
  elf: "#69d36f",
  horde: "#e35a45",
  human: "#5f9df7",
  light: "#f4c95d",
  undead: "#48d5cf",
};
const roleTheme: Record<HeroRole, string> = {
  dealer: "#c84d4d",
  healer: "#5fc6d3",
  supporter: "#b58a45",
  tanker: "#5f82b8",
};
const attributeTheme: Record<HeroAttribute, string> = {
  agility: "#69d36f",
  intelligence: "#7ed4ff",
  strength: "#e35a45",
};
const allFilterColor = "#cbd5e1";
const primarySkillSlots: SkillSlot[] = [
  { label: "Active", missingLabel: "Active TBD", type: "active" },
  { label: "Passive 1", missingLabel: "Passive TBD", type: "passive" },
  { label: "Passive 2", missingLabel: "Passive TBD", type: "passive" },
  { label: "Passive 3", missingLabel: "Passive TBD", type: "passive" },
  { label: "Awaken", missingLabel: "Awaken TBD", type: "awaken" },
];
const draftTagPreview: SkillTag[] = [
  "remove-enemy-buff",
  "remove-ally-debuff",
  "heal-allies",
  "shield",
  "revive-ally",
  "cc",
  "silence",
  "sleep",
  "gain-energy",
];
const skillTagMeta = {
  "absorb-energy": { label: "Energy Steal" },
  "anti-shield": { label: "Anti-Shield" },
  "apply-dot": { label: "Apply DoT" },
  "buff-block": { label: "Buff Block" },
  cc: { label: "CC" },
  "counter-attack": { label: "Counterattack" },
  "damage-cap": { label: "Damage Cap" },
  "ignore-damage-cap": { label: "Ignore Damage Cap" },
  "damage-reduction": { label: "Damage Reduction" },
  execute: { label: "Execute" },
  "gain-energy": { label: "Gain Energy" },
  "give-energy": { label: "Grant Energy" },
  "heal-allies": { label: "Heal Allies" },
  "heal-self": { label: "Self Heal" },
  "healing-over-time": { label: "HoT" },
  "increase-allies-accuracy": { label: "Ally ACC Up" },
  "increase-allies-attack": { label: "Ally ATK Up" },
  "increase-allies-defense": { label: "Ally DEF Up" },
  "increase-allies-lifesteal": { label: "Ally Lifesteal Up" },
  "increase-allies-speed": { label: "Ally Speed Up" },
  "increase-cc-resistance": { label: "CC Resist Up" },
  "increase-crit-damage": { label: "Crit DMG Up" },
  "increase-crit-rate": { label: "Crit Rate Up" },
  "increase-crit-resistance": { label: "Crit Resist Up" },
  "increase-damage-taken": { label: "Vulnerability" },
  "increase-energy-gain": { label: "Energy Gain Up" },
  "increase-healing-received": { label: "Healing Received Up" },
  "increase-self-accuracy": { label: "Self ACC Up" },
  "increase-self-attack": { label: "Self ATK Up" },
  "increase-self-crit-damage": { label: "Self Crit DMG Up" },
  "increase-self-crit-rate": { label: "Self Crit Rate Up" },
  "increase-self-defense": { label: "Self DEF Up" },
  "increase-self-dodge": { label: "Self Dodge Up" },
  "increase-self-lifesteal": { label: "Self Lifesteal Up" },
  "increase-self-penetration": { label: "Self PEN Up" },
  "increase-self-speed": { label: "Self Speed Up" },
  "join-attack": { label: "Assist Attack" },
  "percent-damage": { label: "Percent Damage" },
  "prevent-revive": { label: "Prevent Revive" },
  "reduce-attack": { label: "ATK Down" },
  "reduce-cc-resistance": { label: "CC Resist Down" },
  "reduce-crit-damage": { label: "Crit DMG Down" },
  "reduce-crit-rate": { label: "Crit Rate Down" },
  "reduce-crit-resistance": { label: "Crit Resist Down" },
  "reduce-defense": { label: "DEF Down" },
  "reduce-dot-damage": { label: "DoT Damage Down" },
  "reduce-enemy-speed": { label: "Enemy Speed Down" },
  "reduce-energy": { label: "Energy Down" },
  "reduce-energy-gain": { label: "Energy Gain Down" },
  "reduce-healing-received": { label: "Healing Received Down" },
  "reduce-pres": { label: "PRES Down" },
  "reflect-damage": { label: "Reflect Damage" },
  "remove-ally-debuff": { label: "Cleanse Ally" },
  "remove-cc": { label: "Cleanse CC" },
  "remove-dot": { label: "Cleanse DoT" },
  "remove-enemy-buff": { label: "Dispel Enemy" },
  "remove-self-debuff": { label: "Self Cleanse" },
  "repeat-attack": { label: "Extra Attack" },
  "revive-ally": { label: "Revive Ally" },
  "revive-self": { label: "Self Revive" },
  shield: { label: "Shield" },
  silence: { label: "Silence" },
  sleep: { label: "Sleep" },
  survive: { label: "Survive" },
  taunt: { label: "Taunt" },
} satisfies Record<SkillTag, SkillTagMeta>;
const skillTagGroups: SkillTagGroup[] = [
  {
    color: "#f6c85f",
    label: "Energy",
    tags: [
      "give-energy",
      "gain-energy",
      "increase-energy-gain",
      "reduce-energy",
      "absorb-energy",
      "reduce-energy-gain",
    ],
  },
  {
    color: "#68c58e",
    label: "Healing",
    tags: ["heal-self", "heal-allies", "healing-over-time", "increase-healing-received", "reduce-healing-received"],
  },
  {
    color: "#b981ff",
    label: "Control",
    tags: ["cc", "silence", "sleep", "taunt", "increase-cc-resistance", "reduce-cc-resistance"],
  },
  {
    color: "#7ed4ff",
    label: "Cleanse / Dispel",
    tags: ["remove-enemy-buff", "remove-ally-debuff", "remove-self-debuff", "remove-dot", "remove-cc", "buff-block"],
  },
  {
    color: "#d8ef72",
    label: "Ally Buffs",
    tags: [
      "increase-allies-attack",
      "increase-allies-defense",
      "increase-allies-lifesteal",
      "increase-allies-speed",
      "increase-allies-accuracy",
      "increase-crit-rate",
      "increase-crit-damage",
      "increase-crit-resistance",
    ],
  },
  {
    color: "#ff7a45",
    label: "Enemy Debuffs",
    tags: [
      "increase-damage-taken",
      "reduce-attack",
      "reduce-defense",
      "reduce-pres",
      "reduce-enemy-speed",
      "reduce-crit-resistance",
      "reduce-crit-rate",
      "reduce-crit-damage",
    ],
  },
  {
    color: "#69d36f",
    label: "Self Buffs",
    tags: [
      "increase-self-attack",
      "increase-self-defense",
      "increase-self-speed",
      "increase-self-dodge",
      "increase-self-accuracy",
      "increase-self-penetration",
      "increase-self-lifesteal",
      "increase-self-crit-rate",
      "increase-self-crit-damage",
    ],
  },
  {
    color: "#48d5cf",
    label: "Survival",
    tags: [
      "shield",
      "damage-cap",
      "damage-reduction",
      "reflect-damage",
      "survive",
      "revive-self",
      "revive-ally",
      "prevent-revive",
    ],
  },
  {
    color: "#ff9f5a",
    label: "Attack Triggers",
    tags: ["join-attack", "counter-attack", "repeat-attack", "execute"],
  },
  {
    color: "#e35a45",
    label: "Damage Types",
    tags: ["apply-dot", "reduce-dot-damage", "anti-shield", "percent-damage"],
  },
];
const groupedTagSet = new Set<SkillTag>(skillTagGroups.flatMap((group) => group.tags));

function HeroesPage() {
  const appIconUrl = `${import.meta.env.BASE_URL}brand/favicon.png`;
  const [selectedRace, setSelectedRace] = useState<FilterValue<HeroRace>>("all");
  const [selectedRole, setSelectedRole] = useState<FilterValue<HeroRole>>("all");
  const [selectedAttribute, setSelectedAttribute] = useState<FilterValue<HeroAttribute>>("all");
  const [selectedTag, setSelectedTag] = useState<SkillTag | null>(null);
  const [dimUnmatchedSkills, setDimUnmatchedSkills] = useState(false);

  const availableTags = useMemo<SkillTag[]>(
    () =>
      Array.from(new Set(allHeroes.flatMap((hero) => getHeroSkills(hero).flatMap((skill) => skill.tags)))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [],
  );

  const filteredHeroes = useMemo(
    () =>
      allHeroes.filter((hero) => {
        const skills = getHeroSkills(hero);

        if (selectedRace !== "all" && hero.race !== selectedRace) {
          return false;
        }

        if (selectedRole !== "all" && hero.role !== selectedRole) {
          return false;
        }

        if (selectedAttribute !== "all" && hero.attribute !== selectedAttribute) {
          return false;
        }

        if (selectedTag && !skills.some((skill) => skill.tags.includes(selectedTag))) {
          return false;
        }

        return true;
      }),
    [selectedAttribute, selectedRace, selectedRole, selectedTag],
  );

  const groupedHeroes = useMemo(
    () =>
      races
        .map((race) => ({
          heroes: filteredHeroes.filter((hero) => hero.race === race),
          race,
        }))
        .filter((group) => group.heroes.length > 0),
    [filteredHeroes],
  );

  const tagsForDisplay = availableTags.length > 0 ? availableTags : draftTagPreview;

  function resetFilters() {
    setSelectedRace("all");
    setSelectedRole("all");
    setSelectedAttribute("all");
    setSelectedTag(null);
    setDimUnmatchedSkills(false);
  }

  function selectTag(tag: SkillTag | null) {
    setSelectedTag(tag);

    if (!tag) {
      setDimUnmatchedSkills(false);
    }
  }

  return (
    <main className="min-h-screen bg-souls-void text-souls-parchment">
      <section className="hero-shell min-h-screen py-4">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <nav className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded border border-souls-spirit/30 bg-souls-spirit/10">
                <img alt="Souls icon" className="size-6 object-contain" src={appIconUrl} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-souls-panel">
                Souls Artifacts
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <NavLink to="/">Artifacts</NavLink>
              <NavLink to="/soul-stone-calculator">Soul Stone Calculator</NavLink>
              <NavLink isActive to="/heroes">
                Heroes
              </NavLink>
              <NavLink to="/counterpick">Counterpick</NavLink>
              <NavLink to="/support">Support</NavLink>
            </div>
          </nav>

          <section className="artifact-preview p-3 md:p-4">
            <div className="border-b border-souls-spirit/20 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-souls-spirit">Skill finder</p>
                <h1 className="mt-0.5 text-3xl font-black text-souls-parchment">Heroes</h1>
              </div>
            </div>

            <div className="mt-3">
              <section className="rounded border border-souls-spirit/20 bg-souls-void/45 p-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-1 flex-col gap-2">
                    <FilterGroup
                      getOptionColor={(option) => (option === "all" ? allFilterColor : raceTheme[option])}
                      label="Race"
                      onChange={setSelectedRace}
                      options={races}
                      value={selectedRace}
                    />
                    <FilterGroup
                      getOptionColor={(option) => (option === "all" ? allFilterColor : roleTheme[option])}
                      label="Role"
                      onChange={setSelectedRole}
                      options={roles}
                      value={selectedRole}
                    />
                    <FilterGroup
                      getOptionColor={(option) => (option === "all" ? allFilterColor : attributeTheme[option])}
                      label="Attribute"
                      onChange={setSelectedAttribute}
                      options={attributes}
                      value={selectedAttribute}
                    />
                  </div>
                  <button
                    className="inline-flex min-h-7 items-center gap-1 rounded border border-souls-spirit/20 px-2 text-xs font-medium text-souls-panel transition hover:border-souls-ember hover:bg-souls-ember hover:text-souls-void"
                    onClick={resetFilters}
                    type="button"
                  >
                    <X className="size-3.5" />
                    Reset
                  </button>
                </div>
              </section>

              <TagFilterBar
                availableTags={availableTags}
                dimUnmatchedSkills={dimUnmatchedSkills}
                onDimUnmatchedSkillsChange={setDimUnmatchedSkills}
                onSelectTag={selectTag}
                selectedTag={selectedTag}
                tags={tagsForDisplay}
              />

              {selectedTag ? (
                <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                  {filteredHeroes.map((hero) => (
                    <HeroCard
                      dimUnmatchedSkills={dimUnmatchedSkills}
                      hero={hero}
                      key={hero.id}
                      selectedTag={selectedTag}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-3 space-y-5">
                  {groupedHeroes.map((group) => (
                    <HeroRaceSection
                      dimUnmatchedSkills={dimUnmatchedSkills}
                      heroes={group.heroes}
                      key={group.race}
                      race={group.race}
                      selectedTag={selectedTag}
                    />
                  ))}
                </div>
              )}

              {filteredHeroes.length === 0 ? (
                <div className="mt-3 rounded border border-souls-spirit/18 bg-souls-night/70 p-5 text-sm text-souls-panel">
                  No heroes match the current filters.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function NavLink({
  children,
  isActive = false,
  to,
}: {
  children: ReactNode;
  isActive?: boolean;
  to: "/" | "/soul-stone-calculator" | "/heroes" | "/counterpick" | "/support";
}) {
  return (
    <Link
      className={
        isActive
          ? "rounded border border-souls-gold bg-souls-gold px-3 py-1.5 text-sm font-medium text-souls-void"
          : "rounded border border-souls-spirit/20 px-3 py-1.5 text-sm font-medium text-souls-panel transition hover:border-souls-gold hover:bg-souls-gold hover:text-souls-void"
      }
      to={to}
    >
      {children}
    </Link>
  );
}

function FilterGroup<T extends string>({
  getOptionColor,
  label,
  onChange,
  options,
  value,
}: {
  getOptionColor?: (value: FilterValue<T>) => string;
  label: string;
  onChange: (value: FilterValue<T>) => void;
  options: T[];
  value: FilterValue<T>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-souls-spirit">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {(["all", ...options] as FilterValue<T>[]).map((option) => {
          const isActive = value === option;
          const optionColor = getOptionColor?.(option) ?? allFilterColor;

          return (
            <button
              className="min-h-7 rounded border px-2.5 text-xs font-medium capitalize transition hover:brightness-110"
              key={option}
              onClick={() => onChange(option)}
              style={{
                backgroundColor: isActive ? optionColor : `${optionColor}10`,
                borderColor: isActive ? optionColor : `${optionColor}35`,
                color: isActive ? "#111522" : optionColor,
              }}
              type="button"
            >
              {formatLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TagFilterBar({
  availableTags,
  dimUnmatchedSkills,
  onDimUnmatchedSkillsChange,
  onSelectTag,
  selectedTag,
  tags,
}: {
  availableTags: SkillTag[];
  dimUnmatchedSkills: boolean;
  onDimUnmatchedSkillsChange: (value: boolean) => void;
  onSelectTag: (tag: SkillTag | null) => void;
  selectedTag: SkillTag | null;
  tags: SkillTag[];
}) {
  const [tagQuery, setTagQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const hasRealTags = availableTags.length > 0;
  const normalizedTagQuery = normalizeSearchValue(tagQuery);
  const matchesTagQuery = (tag: SkillTag) => {
    if (!normalizedTagQuery) {
      return true;
    }

    return normalizeSearchValue(`${tag} ${getSkillTagLabel(tag)}`).includes(normalizedTagQuery);
  };
  const tagGroups = [
    ...skillTagGroups
      .map((group) => ({
        ...group,
        tags: group.tags.filter((tag) => tags.includes(tag)),
      }))
      .filter((group) => group.tags.length > 0),
    {
      color: "#7ed4ff",
      label: "Other",
      tags: tags.filter((tag) => !groupedTagSet.has(tag)),
    },
  ].filter((group) => group.tags.length > 0);
  const [activeTagGroupLabel, setActiveTagGroupLabel] = useState(tagGroups[0]?.label ?? "");
  const activeTagGroup = tagGroups.find((group) => group.label === activeTagGroupLabel) ?? tagGroups[0];
  const visibleTagGroups = normalizedTagQuery
    ? tagGroups
        .map((group) => ({
          ...group,
          tags: group.tags.filter((tag) => matchesTagQuery(tag)),
        }))
        .filter((group) => group.tags.length > 0)
    : showAllTags
      ? tagGroups
      : activeTagGroup
        ? [activeTagGroup]
        : [];

  return (
    <section className="mt-2 rounded border border-souls-spirit/20 bg-souls-night/78 p-2 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-souls-spirit">Tags</p>
            {!hasRealTags ? (
              <p className="text-[11px] text-souls-panel/70">Preview until skill tags are added.</p>
            ) : null}
          </div>
          <label className="flex min-h-8 w-full items-center gap-2 rounded border border-souls-spirit/20 bg-souls-void/45 px-2.5 text-xs text-souls-panel focus-within:border-souls-spirit md:w-64">
            <Search className="size-3.5 shrink-0 text-souls-spirit" />
            <input
              className="min-w-0 flex-1 bg-transparent text-souls-parchment outline-none placeholder:text-souls-panel/55"
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder="Find tag"
              type="search"
              value={tagQuery}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            className="min-h-6 rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!hasRealTags}
            onClick={() => setShowAllTags((value) => !value)}
            style={{
              backgroundColor: showAllTags && !normalizedTagQuery ? "#cbd5e1" : "#cbd5e114",
              borderColor: showAllTags && !normalizedTagQuery ? "#cbd5e1" : "#cbd5e145",
              color: showAllTags && !normalizedTagQuery ? "#111522" : "#cbd5e1",
            }}
            type="button"
          >
            {showAllTags && !normalizedTagQuery ? "Show less" : "Show all"}
          </button>
          {tagGroups.map((group) => {
            const isActive = !normalizedTagQuery && !showAllTags && activeTagGroup?.label === group.label;

            return (
              <button
                className="min-h-6 rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-55"
                disabled={!hasRealTags}
                key={group.label}
                onClick={() => {
                  setActiveTagGroupLabel(group.label);
                  setShowAllTags(false);
                }}
                style={{
                  backgroundColor: isActive ? group.color : `${group.color}10`,
                  borderColor: isActive ? group.color : `${group.color}35`,
                  color: isActive ? "#111522" : group.color,
                }}
                type="button"
              >
                {group.label}
              </button>
            );
          })}
        </div>

        <div className="grid max-h-[42dvh] gap-2 overflow-y-auto pr-1 md:max-h-none md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:overflow-visible md:pr-0">
          {visibleTagGroups.map((group) => (
            <div className="min-w-0" key={group.label}>
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: group.color }}>
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.tags.map((tag) => {
                  const isActive = selectedTag === tag;

                  return (
                    <button
                      className="min-h-6 rounded border px-2 py-0.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-55"
                      disabled={!hasRealTags}
                      key={tag}
                      onClick={() => {
                        setActiveTagGroupLabel(group.label);
                        onSelectTag(isActive ? null : tag);
                      }}
                      style={{
                        backgroundColor: isActive ? group.color : `${group.color}14`,
                        borderColor: isActive ? group.color : `${group.color}45`,
                        color: isActive ? "#111522" : group.color,
                      }}
                      type="button"
                    >
                      {getSkillTagLabel(tag)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <label className="ml-auto flex w-fit items-center gap-2 rounded border border-souls-spirit/20 bg-souls-void/35 px-2.5 py-1 text-xs font-medium text-souls-panel has-[:disabled]:opacity-55">
          <input
            checked={dimUnmatchedSkills}
            className="sr-only"
            disabled={!selectedTag}
            onChange={(event) => onDimUnmatchedSkillsChange(event.target.checked)}
            type="checkbox"
          />
          <span
            className={`grid h-5 w-9 rounded-full border p-0.5 transition ${
              dimUnmatchedSkills ? "border-souls-gold bg-souls-gold/25" : "border-souls-spirit/25 bg-souls-void/70"
            }`}
          >
            <span
              className={`size-3.5 rounded-full transition ${
                dimUnmatchedSkills ? "translate-x-4 bg-souls-gold" : "bg-souls-panel"
              }`}
            />
          </span>
          Highlight matched skills
        </label>
      </div>
    </section>
  );
}

function HeroRaceSection({
  dimUnmatchedSkills,
  heroes,
  race,
  selectedTag,
}: {
  dimUnmatchedSkills: boolean;
  heroes: Hero[];
  race: HeroRace;
  selectedTag: SkillTag | null;
}) {
  const accentColor = raceTheme[race];

  return (
    <section>
      <div className="mb-2.5 flex items-center gap-3">
        <h2 className="text-lg font-black uppercase tracking-[0.18em]" style={{ color: accentColor }}>
          {formatLabel(race)}
        </h2>
        <span className="h-px flex-1 opacity-35" style={{ backgroundColor: accentColor }} />
        <span
          className="rounded border px-2 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: `${accentColor}1f`,
            borderColor: `${accentColor}55`,
            color: accentColor,
          }}
        >
          {heroes.length} {heroes.length === 1 ? "hero" : "heroes"}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {heroes.map((hero) => (
          <HeroCard dimUnmatchedSkills={dimUnmatchedSkills} hero={hero} key={hero.id} selectedTag={selectedTag} />
        ))}
      </div>
    </section>
  );
}

function HeroCard({
  dimUnmatchedSkills,
  hero,
  selectedTag,
}: {
  dimUnmatchedSkills: boolean;
  hero: Hero;
  selectedTag: SkillTag | null;
}) {
  const skillLayout = getHeroSkillLayout(hero);
  const isHighlightMode = dimUnmatchedSkills && Boolean(selectedTag);
  const isSkillMatched = (skill: Skill | null) => Boolean(selectedTag && skill?.tags.includes(selectedTag));
  const isSkillDimmed = (skill: Skill | null) => isHighlightMode && !isSkillMatched(skill);

  return (
    <article className="hero-card">
      <div className="grid grid-cols-[56px_minmax(0,1fr)_56px] items-end gap-3 text-center">
        <div className="grid justify-items-center gap-2">
          <SkillIconSlot
            className="size-full min-h-0"
            isDimmed={isSkillDimmed(skillLayout.exclusiveEquipment)}
            isMatched={isSkillMatched(skillLayout.exclusiveEquipment)}
            label="Exclusive equipment"
            missingLabel="No exclusive equipment"
            skill={skillLayout.exclusiveEquipment}
            tooltipPlacement="bottom"
            type="exclusive-equipment"
          />
          <HeroMetaIcon
            imageUrl={hero.role ? roleIconUrl(hero.role) : null}
            label={hero.role ? formatLabel(hero.role) : "Role TBD"}
          />
        </div>

        <div className="min-w-0">
          <div className="hero-portrait relative mx-auto grid size-20 place-items-center overflow-hidden rounded bg-souls-void/55 border border-souls-spirit/35">
            <img alt={hero.name} className="size-full object-cover object-top" src={hero.imageUrl} />
          </div>
          <h2 className="mt-3 truncate text-xl font-black text-souls-parchment">{hero.name}</h2>
        </div>

        <div className="grid justify-items-center gap-2">
          <SkillIconSlot
            className="size-full min-h-0"
            isDimmed={isSkillDimmed(skillLayout.engraving)}
            isMatched={isSkillMatched(skillLayout.engraving)}
            label="Engraving"
            missingLabel="Engraving TBD"
            skill={skillLayout.engraving}
            tooltipPlacement="bottom"
            type="engraving"
          />
          <HeroMetaIcon
            imageUrl={hero.attribute ? attributeIconUrl(hero.attribute) : null}
            label={hero.attribute ? formatLabel(hero.attribute) : "Attribute TBD"}
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="grid grid-cols-5 gap-2">
          {primarySkillSlots.map((slot, index) => (
            <SkillIconSlot
              isDimmed={isSkillDimmed(skillLayout.primary[index] ?? null)}
              isMatched={isSkillMatched(skillLayout.primary[index] ?? null)}
              key={`${slot.type}-${index}`}
              label={slot.label}
              missingLabel={slot.missingLabel}
              skill={skillLayout.primary[index] ?? null}
              type={slot.type}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function HeroMetaIcon({
  className = "",
  imageUrl,
  label,
}: {
  className?: string;
  imageUrl: string | null;
  label: string;
}) {
  return (
    <span
      aria-label={label}
      className={`grid size-11 place-items-center rounded border border-souls-spirit/20 bg-souls-void/45 p-2 shadow-[0_0_12px_rgba(0,0,0,0.28)] ${className}`}
    >
      {imageUrl ? (
        <img alt="" aria-hidden="true" className="size-full object-contain" src={imageUrl} />
      ) : (
        <BadgeQuestionMark aria-hidden="true" className="size-6 text-souls-spirit" />
      )}
    </span>
  );
}

function SkillIconSlot({
  className = "",
  isDimmed = false,
  isMatched = false,
  label,
  missingLabel,
  skill,
  tooltipPlacement = "top",
  type,
}: {
  className?: string;
  isDimmed?: boolean;
  isMatched?: boolean;
  label: string;
  missingLabel: string;
  skill: Skill | null;
  tooltipPlacement?: TooltipPlacement;
  type: SkillType;
}) {
  const Icon = getSkillIcon(type);
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const tooltipTitle = skill?.name ?? missingLabel;
  const tooltipDescription = skill?.description || "Description will appear here once skill data is filled.";

  function openTooltip(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const tooltipWidth = 288;
    const tooltipHeight = 236;
    const viewportPadding = 12;
    const centeredLeft = rect.left + rect.width / 2;
    const minLeft = tooltipWidth / 2 + viewportPadding;
    const maxLeft = window.innerWidth - tooltipWidth / 2 - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const placement =
      tooltipPlacement === "bottom" && spaceBelow < tooltipHeight && spaceAbove > spaceBelow
        ? "top"
        : tooltipPlacement === "top" && spaceAbove < tooltipHeight && spaceBelow > spaceAbove
          ? "bottom"
          : tooltipPlacement;

    setTooltipState({
      left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
      maxHeight: Math.max(160, window.innerHeight - viewportPadding * 2),
      placement,
      top: placement === "bottom" ? rect.bottom + 8 : rect.top - 8,
    });
  }

  return (
    <button
      className={`skill-slot group relative flex min-h-14 flex-col items-center justify-center gap-1 rounded border border-souls-spirit/16 bg-souls-void/36 px-1.5 py-2 text-center transition data-[dimmed=true]:opacity-20 data-[dimmed=true]:saturate-50 data-[filled=false]:border-dashed data-[matched=true]:border-souls-gold data-[matched=true]:bg-souls-gold/15 ${className}`}
      data-dimmed={isDimmed}
      data-filled={Boolean(skill)}
      data-matched={isMatched}
      onBlur={() => setTooltipState(null)}
      onFocus={(event) => openTooltip(event.currentTarget)}
      onMouseEnter={(event) => openTooltip(event.currentTarget)}
      onMouseLeave={() => setTooltipState(null)}
      type="button"
    >
      <Icon className="size-4 text-souls-spirit group-data-[matched=true]:text-souls-gold" />
      <span className="text-[10px] font-black uppercase tracking-[0.08em] text-souls-spirit">
        {getSkillTypeLabel(type)}
      </span>
      {tooltipState && typeof document !== "undefined"
        ? createPortal(
            <span
              className="skill-tooltip pointer-events-none fixed z-[9999] w-72 rounded border px-4 py-3 text-left text-sm font-normal text-souls-panel shadow-2xl"
              style={{
                left: tooltipState.left,
                maxHeight: tooltipState.maxHeight,
                overflowY: "auto",
                top: tooltipState.top,
                transform: tooltipState.placement === "top" ? "translate(-50%, -100%)" : "translateX(-50%)",
              }}
            >
              <strong className="block text-base text-souls-parchment">{tooltipTitle}</strong>
              <span className="mt-1.5 block font-semibold text-souls-spirit">{label}</span>
              <span className="mt-1.5 block leading-relaxed">{tooltipDescription}</span>
            </span>,
            document.body,
          )
        : null}
    </button>
  );
}

function getHeroSkillLayout(hero: Hero): {
  engraving: Skill | null;
  exclusiveEquipment: Skill | null;
  primary: Array<Skill | null>;
} {
  const skills = getHeroSkills(hero);
  const active = skills.find((skill) => skill.type === "active") ?? null;
  const passives = skills.filter((skill) => skill.type === "passive");
  const awaken = skills.find((skill) => skill.type === "awaken") ?? null;

  return {
    engraving: skills.find((skill) => skill.type === "engraving") ?? null,
    exclusiveEquipment: skills.find((skill) => skill.type === "exclusive-equipment") ?? null,
    primary: [active, passives[0] ?? null, passives[1] ?? null, passives[2] ?? null, awaken],
  };
}

function getHeroSkills(hero: Hero): Skill[] {
  const skills: readonly (Skill | undefined)[] = hero.skills;
  return skills.filter((skill): skill is Skill => skill !== undefined);
}

function getSkillIcon(type: SkillType): ComponentType<{ className?: string }> {
  switch (type) {
    case "active":
      return Sword;
    case "passive":
      return Shield;
    case "awaken":
      return Sparkles;
    case "engraving":
      return Gem;
    case "exclusive-equipment":
      return Zap;
    default:
      return BadgeQuestionMark;
  }
}

function getSkillTypeLabel(type: SkillType): string {
  switch (type) {
    case "active":
      return "ACT";
    case "passive":
      return "PAS";
    case "awaken":
      return "AWK";
    case "engraving":
      return "ENG";
    case "exclusive-equipment":
      return "EE";
    default:
      return formatLabel(type);
  }
}

function publicAssetUrl(path: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

  return `${baseUrl}${path}`;
}

function roleIconUrl(role: HeroRole): string {
  return publicAssetUrl(`role_ref/${role}.png`);
}

function attributeIconUrl(attribute: HeroAttribute): string {
  return publicAssetUrl(`attribute_ref/${attribute}.png`);
}

function formatLabel(value: string): string {
  return value.replaceAll("-", " ");
}

function getSkillTagLabel(tag: SkillTag): string {
  return skillTagMeta[tag].label;
}

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
