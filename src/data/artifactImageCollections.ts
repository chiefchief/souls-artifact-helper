export type ArtifactImage = {
  id: string;
  name: string;
  imageUrl: string;
  ratings: ArtifactRatings;
  crafting?: CraftingRecipe;
};

/**
 * 0 means that the artifact has not been ranked yet. Decimal values preserve
 * the order inside a tier: for example, 5.01 is displayed in tier 5 but is
 * sorted ahead of 5.00.
 */
export type ArtifactRating = number;

export type ArtifactRatings = {
  pvp: ArtifactRating;
  pve: ArtifactRating;
};

export type CraftingRecipe = {
  ingredients: CraftingIngredient[];
  source: "user-provided" | "web-verified";
  note?: string;
};

export type CraftingIngredient = {
  artifactId: string;
  quantity: number;
};

export type ArtifactImageCollection = {
  id: string;
  title: string;
  description: string;
  images: ArtifactImage[];
};

function withBase(path: string): string {
  const normalizedBase = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

function userProvidedRecipe(artifactId: string): CraftingRecipe {
  return {
    ingredients: [{ artifactId, quantity: 4 }],
    source: "user-provided",
  };
}

const mythicArtifacts: ArtifactImage[] = [
  {
    id: "mythic-01",
    name: "Oblivion",
    imageUrl: "/artifacts/mythic/oblivion.png",
    crafting: userProvidedRecipe("legendary-11"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-02",
    name: "Shield of Earth",
    imageUrl: "/artifacts/mythic/shield-of-earth.png",
    crafting: userProvidedRecipe("legendary-05"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-03",
    name: "Mace of Judgment",
    imageUrl: "/artifacts/mythic/mace-of-judgment.png",
    crafting: userProvidedRecipe("legendary-12"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-04",
    name: "Evidence of Miracle",
    imageUrl: "/artifacts/mythic/evidence-of-miracle.png",
    crafting: userProvidedRecipe("legendary-18"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-05",
    name: "Demonic Beast Fang",
    imageUrl: "/artifacts/mythic/demonic-beast-fang.png",
    crafting: userProvidedRecipe("legendary-07"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-06",
    name: "Orb of Priest",
    imageUrl: "/artifacts/mythic/orb-of-priest.png",
    crafting: userProvidedRecipe("legendary-04"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-07",
    name: "Reaping Scythe",
    imageUrl: "/artifacts/mythic/reaping-scythe.png",
    crafting: userProvidedRecipe("legendary-06"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-08",
    name: "Golden Ornament Cloak",
    imageUrl: "/artifacts/mythic/golden-ornament-cloak.png",
    crafting: userProvidedRecipe("legendary-01"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-09",
    name: "Serpent's Emblem",
    imageUrl: "/artifacts/mythic/serpents-emblem.png",
    crafting: userProvidedRecipe("legendary-31"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-10",
    name: "Mask of Madness",
    imageUrl: "/artifacts/mythic/mask-of-madness.png",
    crafting: userProvidedRecipe("legendary-27"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-11",
    name: "Staff of Bloodlord",
    imageUrl: "/artifacts/mythic/staff-of-bloodlord.png",
    crafting: userProvidedRecipe("legendary-22"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-12",
    name: "Branch of Beginnings",
    imageUrl: "/artifacts/mythic/branch-of-beginnings.png",
    crafting: userProvidedRecipe("legendary-29"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-13",
    name: "Helmet of Silence",
    imageUrl: "/artifacts/mythic/helmet-of-silence.png",
    crafting: userProvidedRecipe("legendary-26"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-14",
    name: "Eternal Pain",
    imageUrl: "/artifacts/mythic/eternal-pain.png",
    crafting: userProvidedRecipe("legendary-25"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-15",
    name: "Tome of the Sun",
    imageUrl: "/artifacts/mythic/tome-of-the-sun.png",
    crafting: userProvidedRecipe("legendary-21"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-16",
    name: "Death",
    imageUrl: "/artifacts/mythic/death.png",
    crafting: userProvidedRecipe("legendary-02"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-17",
    name: "Turbulent Lamp of Wrath",
    imageUrl: "/artifacts/mythic/turbulent-lamp-of-wrath.png",
    crafting: userProvidedRecipe("legendary-19"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-18",
    name: "Eternal Bond",
    imageUrl: "/artifacts/mythic/eternal-bond.png",
    crafting: userProvidedRecipe("legendary-08"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-19",
    name: "Paladin Cuirass",
    imageUrl: "/artifacts/mythic/paladin-cuirass.png",
    crafting: userProvidedRecipe("legendary-26"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-20",
    name: "Noble's Pocket Watch",
    imageUrl: "/artifacts/mythic/nobles-pocket-watch.png",
    crafting: userProvidedRecipe("legendary-16"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-21",
    name: "Sacred Emblem",
    imageUrl: "/artifacts/mythic/sacred-emblem.png",
    crafting: userProvidedRecipe("legendary-22"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-22",
    name: "Cursed Chalice",
    imageUrl: "/artifacts/mythic/cursed-chalice.png",
    crafting: userProvidedRecipe("legendary-06"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-23",
    name: "Harmony",
    imageUrl: "/artifacts/mythic/harmony.png",
    crafting: userProvidedRecipe("legendary-03"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-24",
    name: "Warrior's Axe",
    imageUrl: "/artifacts/mythic/warriors-axe.png",
    crafting: userProvidedRecipe("legendary-09"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-25",
    name: "Circlet of Amplification",
    imageUrl: "/artifacts/mythic/circlet-of-amplification.png",
    crafting: userProvidedRecipe("legendary-04"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-26",
    name: "Nightmare",
    imageUrl: "/artifacts/mythic/nightmare.png",
    crafting: userProvidedRecipe("legendary-14"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-27",
    name: "Codex of Flame Rites Vol. 3: Serenity",
    imageUrl: "/artifacts/mythic/codex-of-flame-rites-vol-3-serenity.png",
    crafting: userProvidedRecipe("legendary-18"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-28",
    name: "Giant's Boomerang",
    imageUrl: "/artifacts/mythic/giants-boomerang.png",
    crafting: userProvidedRecipe("legendary-10"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-29",
    name: "Steel Bishop",
    imageUrl: "/artifacts/mythic/steel-bishop.png",
    crafting: userProvidedRecipe("legendary-15"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-30",
    name: "Gloves of Resonance",
    imageUrl: "/artifacts/mythic/gloves-of-resonance.png",
    crafting: userProvidedRecipe("legendary-13"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-31",
    name: "Codex of Flame Rites Vol. 1: Fervor",
    imageUrl: "/artifacts/mythic/codex-of-flame-rites-vol-1-fervor.png",
    crafting: userProvidedRecipe("legendary-18"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-32",
    name: "Scale of Balance",
    imageUrl: "/artifacts/mythic/scale-of-balance.png",
    crafting: userProvidedRecipe("legendary-32"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-33",
    name: "Abyssal Jevel",
    imageUrl: "/artifacts/mythic/abyssal-jewel.png",
    crafting: userProvidedRecipe("legendary-33"),
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "mythic-34",
    name: "Primal Claw",
    imageUrl: "/artifacts/mythic/primal-claw.png",
    crafting: undefined,
    ratings: { pve: 0, pvp: 0 },
  },
];

const legendaryArtifacts: ArtifactImage[] = [
  {
    id: "legendary-01",
    name: "Sword of the Monster Hunter",
    imageUrl: "/artifacts/legendary/sword-of-the-monster-hunter.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-02",
    name: "Earrings of Tranquility",
    imageUrl: "/artifacts/legendary/earrings-of-tranquility.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-03",
    name: "Tome of Regeneration",
    imageUrl: "/artifacts/legendary/tome-of-regeneration.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-04",
    name: "Soul Sand",
    imageUrl: "/artifacts/legendary/soul-sand.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-05",
    name: "Shield of the Guardian",
    imageUrl: "/artifacts/legendary/shield-of-the-guardian.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-06",
    name: "Staff of Infinite Vitality",
    imageUrl: "/artifacts/legendary/staff-of-infinite-vitality.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-07",
    name: "Grip of Hell",
    imageUrl: "/artifacts/legendary/grip-of-hell.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-08",
    name: "Emblem of Continuance",
    imageUrl: "/artifacts/legendary/emblem-of-continuance.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-09",
    name: "Oath of the Past",
    imageUrl: "/artifacts/legendary/oath-of-the-past.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-10",
    name: "Executioner's Axe",
    imageUrl: "/artifacts/legendary/executioners-axe.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-11",
    name: "Madness Talisman",
    imageUrl: "/artifacts/legendary/madness-talisman.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-12",
    name: "Book of Forbidden Knowledge",
    imageUrl: "/artifacts/legendary/book-of-forbidden-knowledge.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-13",
    name: "Ancient Inscription Tablet",
    imageUrl: "/artifacts/legendary/ancient-inscription-tablet.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-14",
    name: "Blacksmith's Hammer",
    imageUrl: "/artifacts/legendary/blacksmiths-hammer.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-15",
    name: "Fortune Coin",
    imageUrl: "/artifacts/legendary/fortune-coin.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-16",
    name: "Mysterious Patterned Leaf",
    imageUrl: "/artifacts/legendary/mysterious-patterned-leaf.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-17",
    name: "Adventurer's Chronicle",
    imageUrl: "/artifacts/legendary/adventurers-chronicle.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-18",
    name: "Essence of Burning Flame",
    imageUrl: "/artifacts/legendary/essence-of-burning-flame.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-19",
    name: "Rider's Horn",
    imageUrl: "/artifacts/legendary/riders-horn.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-20",
    name: "Crown of Fire",
    imageUrl: "/artifacts/legendary/crown-of-fire.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-21",
    name: "Spear of the Monster Hunter",
    imageUrl: "/artifacts/legendary/spear-of-the-monster-hunter.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-22",
    name: "Steel Beast's Bone",
    imageUrl: "/artifacts/legendary/steel-beasts-bone.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-23",
    name: "Gold Earrings",
    imageUrl: "/artifacts/legendary/gold-earrings.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-24",
    name: "Guide's Vambrace",
    imageUrl: "/artifacts/legendary/guides-vambrace.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-25",
    name: "Demonic Ring",
    imageUrl: "/artifacts/legendary/demonic-ring.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-26",
    name: "Relentless Knight's Helmet",
    imageUrl: "/artifacts/legendary/relentless-knights-helmet.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-27",
    name: "Crystal of Eternal Healing",
    imageUrl: "/artifacts/legendary/crystal-of-eternal-healing.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-28",
    name: "Mace of Punishment",
    imageUrl: "/artifacts/legendary/mace-of-punishment.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-29",
    name: "Guardian of the Sage",
    imageUrl: "/artifacts/legendary/guardian-of-the-sage.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-30",
    name: "Cursed Sword",
    imageUrl: "/artifacts/legendary/cursed-sword.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-31",
    name: "Dragon Hide Shield",
    imageUrl: "/artifacts/legendary/dragon-hide-shield.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-32",
    name: "Key of Dawn",
    imageUrl: "/artifacts/legendary/key-of-dawn.png",
    ratings: { pve: 0, pvp: 0 },
  },
  {
    id: "legendary-33",
    name: "Oath of Sacrifice",
    imageUrl: "/artifacts/legendary/oath-of-sacrifice.png",
    ratings: { pve: 0, pvp: 0 },
  },
];

const rawArtifactImageCollections: ArtifactImageCollection[] = [
  {
    id: "mythic",
    title: "Mythic artifacts",
    description: "These icons were cropped from the provided Mythic artifact list and mapped to their in-game names.",
    images: mythicArtifacts,
  },
  {
    id: "legendary",
    title: "Legendary artifacts",
    description:
      "These icons were cropped from the provided Legendary artifact list and mapped to their in-game names.",
    images: legendaryArtifacts,
  },
];

export const artifactIdToImageUrl: Record<string, string> = [...mythicArtifacts, ...legendaryArtifacts].reduce(
  (map, artifact) => {
    map[artifact.id] = artifact.imageUrl;
    return map;
  },
  {} as Record<string, string>,
);

export const artifactImageCollections: ArtifactImageCollection[] = rawArtifactImageCollections.map((collection) => ({
  ...collection,
  images: collection.images.map((image) => ({
    ...image,
    imageUrl: withBase(image.imageUrl),
  })),
}));

export const artifactImageCount = rawArtifactImageCollections.reduce(
  (total, collection) => total + collection.images.length,
  0,
);
