export type ProjectCategory =
  | "unity-asset"
  | "rpgmaker-plugin"
  | "game";

export type ProjectLinkType =
  | "itch"
  | "asset-store"
  | "github"
  | "documentation"
  | "video"
  | "website"
  | "other";

export interface ProjectLink {
  type: ProjectLinkType;
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  category: ProjectCategory;
  description: string;
  longDescription?: string;
  technologies: string[];
  platforms: string[];
  links: ProjectLink[];
  featured?: boolean;
  tags?: string[];
  coverImage?: string;
  jam?: {
    name: string;
    url?: string;
    year?: string;
  };
  notes?: string[];
  releasedOn?: string; // ISO string for sorting
  sortPriority?: number; // Higher numbers appear first if provided
}

export const projects: Project[] = [
  {
    id: "pixel-engine-for-unity",
    title: "Pixel Engine for Unity",
    subtitle: "Retro-inspired systems toolkit",
    category: "unity-asset",
    description:
      "A versatile engine tailored for Unity, equipped with dialogue, data, and systems tooling ideal for retro-inspired games.",
    technologies: ["Unity", "C#", "XNode", "Scriptable Objects"],
    platforms: ["Unity Asset"],
    links: [
      {
        type: "itch",
        label: "Itch.io Store",
        url: "https://dragonlens.itch.io/pxe",
      },
    ],
    featured: true,
    tags: [
      "Dialogue System",
      "Data Management",
      "Cinemachine Integration",
      "Crafting System",
    ],
    notes: [
      "Includes systems for dialogue, variables, achievements, and persistence",
      "Development utilities such as sprite-to-animation, state, level, and audio management",
      "Integrations for Newtonsoft JSON, tilemaps, Cinemachine, and the Unity Input System",
      "Bonus modules for crafting, equipment, spawning, checkpoints, and in-game debugging",
    ],
    releasedOn: "2024-10-01",
    sortPriority: 100,
  },
  {
    id: "tbs-2d-turn-based-battle-system",
    title: "TBS - 2D Turn-based Battle System",
    subtitle: "Unity battle system template",
    category: "unity-asset",
    description:
      "A flexible and extensible 2D turn-based battle system template designed for RPG projects.",
    technologies: ["Unity", "C#", "Scriptable Objects"],
    platforms: ["Unity Asset"],
    links: [
      {
        type: "asset-store",
        label: "Unity Asset Store",
        url: "https://assetstore.unity.com/packages/templates/systems/tbs-2d-turn-based-battle-system-225475",
      },
    ],
    tags: ["Battle System", "Turn-based", "RPG"],
    notes: [
      "Designed for both newcomers and advanced users with full source code",
      "Active development roadmap with upcoming demos and docs",
    ],
    releasedOn: "2023-05-01",
    sortPriority: 70,
  },
  {
    id: "random-loot-system",
    title: "Random Loot System",
    subtitle: "RPG Maker MV/MZ plugin",
    category: "rpgmaker-plugin",
    description:
      "A comprehensive loot table system for RPG Maker MV & MZ with flexible reward definitions and plugin commands.",
    technologies: ["RPG Maker MV", "RPG Maker MZ", "JavaScript"],
    platforms: ["RPG Maker Plugin"],
    links: [
      {
        type: "itch",
        label: "Itch.io Store",
        url: "https://mythatelier.itch.io/random-loot-system",
      },
    ],
    featured: true,
    tags: ["Loot Tables", "Plugin Commands", "Debug Tools"],
    notes: [
      "Supports fixed, percentage, and weighted loot draws with seed replication",
      "Integrates with events, skills, items, enemies, and troops",
      "Includes a toggleable debug messaging system",
    ],
    releasedOn: "2024-08-01",
    sortPriority: 90,
  },
  {
    id: "timeless-the-last-artifacts",
    title: "Timeless: The Last Artifacts",
    subtitle: "Steampunk roguelite adventure",
    category: "game",
    description:
      "A story-driven roguelite about preserving sanity and stability in a collapsing timeline of procedural chambers.",
    technologies: ["JavaScript", "HTML5", "CSS"],
    platforms: ["Web", "Mobile"],
    links: [
      {
        type: "github",
        label: "Source Code",
        url: "https://github.com/Monydragon/Timeless-The-Last-Artifacts",
      },
      {
        type: "itch",
        label: "Play on Itch.io",
        url: "https://monydragon.itch.io/timeless-the-last-artifacts",
      },
    ],
    featured: true,
    tags: ["Roguelite", "Procedural", "Narrative"],
    notes: [
      "Created from 16 prompts in 12 hours",
      "Features sanity vs. time mechanics with cooperative play",
    ],
    releasedOn: "2025-11-08",
    sortPriority: 80,
  },
  {
    id: "phantasy-quest-the-prologue",
    title: "Phantasy Quest: The Prologue",
    subtitle: "Old-school RPG love letter",
    category: "game",
    description:
      "A nostalgic RPG inspired by Final Fantasy, Dragon Quest, and Chrono Trigger with modern storytelling twists.",
    technologies: ["RPG Maker VX Ace", "Ruby"],
    platforms: ["Windows"],
    links: [
      {
        type: "itch",
        label: "Download on Itch.io",
        url: "https://monydragon.itch.io/phantasy-quest-the-prologue",
      },
    ],
    featured: true,
    tags: ["RPG", "Story-driven", "JRPG"],
    releasedOn: "2023-11-01",
    sortPriority: 65,
  },
  {
    id: "lost-dreams",
    title: "Lost Dreams",
    subtitle: "Action adventure dreamscape",
    category: "game",
    description:
      "A Zelda-like adventure about reclaiming creativity after betrayal, starring Blue and their dog Biscuit.",
    technologies: ["Unity", "C#", "Fungus"],
    platforms: ["Web", "Windows", "Linux", "Android (Coming Soon)"] ,
    links: [
      {
        type: "itch",
        label: "Play on Itch.io",
        url: "https://dragonlens.itch.io/lost-dreams",
      },
      {
        type: "website",
        label: "Brackeys Game Jam 2022.1 Entry",
        url: "https://itch.io/jam/brackeys-7/rate/1420808",
      },
    ],
    featured: true,
    tags: ["Game Jam", "Action Adventure", "Puzzles"],
    jam: {
      name: "Brackeys Game Jam 2022.1",
      url: "https://itch.io/jam/brackeys-7",
      year: "2022",
    },
    releasedOn: "2022-02-01",
    sortPriority: 60,
  },
  {
    id: "luminous",
    title: "Luminous",
    subtitle: "Light-based puzzle adventure",
    category: "game",
    description:
      "Navigate a haunted forest using a color-changing candle while evading the death fox guardian.",
    technologies: ["Unity", "C#"],
    platforms: ["Web", "Windows", "Linux", "Android (Coming Soon)"] ,
    links: [
      {
        type: "itch",
        label: "Play on Itch.io",
        url: "https://dragonlens.itch.io/luminous",
      },
      {
        type: "website",
        label: "Brackeys Game Jam 2022.2 Entry",
        url: "https://itch.io/jam/brackeys-8/rate/1681397",
      },
    ],
    tags: ["Game Jam", "Puzzle", "Atmospheric"],
    jam: {
      name: "Brackeys Game Jam 2022.2",
      url: "https://itch.io/jam/brackeys-8",
      year: "2022",
    },
    releasedOn: "2022-09-01",
    sortPriority: 55,
  },
  {
    id: "the-afterlife",
    title: "The Afterlife",
    subtitle: "Puzzle escape adventure",
    category: "game",
    description:
      "Solve puzzles to escape the afterlife and seize a new beginning after an untimely demise.",
    technologies: ["Unity", "C#"],
    platforms: ["Web", "Windows", "Linux", "Android (Coming Soon)"] ,
    links: [
      {
        type: "itch",
        label: "Play on Itch.io",
        url: "https://dragonlens.itch.io/the-afterlife",
      },
    ],
    tags: ["Puzzle", "Adventure"],
    releasedOn: "2021-11-01",
    sortPriority: 50,
  },
  {
    id: "oceans-call",
    title: "Oceans Call",
    subtitle: "Underwater platformer rescue",
    category: "game",
    description:
      "Guide a compassionate mermaid through treacherous seas to rescue a shipwreck survivor while evading deadly threats.",
    technologies: ["Unity", "C#", "Pixel Engine for Unity"],
    platforms: ["Web", "Windows", "Linux", "Android (Coming Soon)"] ,
    links: [
      {
        type: "itch",
        label: "Play on Itch.io",
        url: "https://dragonlens.itch.io/oceanscall",
      },
    ],
    tags: ["Game Jam", "Platformer", "Narrative"],
    jam: {
      name: "Brackeys Game Jam 2023.2",
      url: "https://itch.io/jam/brackeys-2023-2",
      year: "2023",
    },
    releasedOn: "2023-08-01",
    sortPriority: 58,
  },
  {
    id: "were-live",
    title: "We're Live",
    subtitle: "Streamer FPS challenge",
    category: "game",
    description:
      "Blend fast-paced FPS combat with the pressures of live streaming, balancing viewer engagement with survival.",
    technologies: ["Unity", "C#", "Pixel Engine for Unity"],
    platforms: ["Web", "Windows", "Linux", "Android (Coming Soon)"] ,
    links: [
      {
        type: "itch",
        label: "Play on Itch.io",
        url: "https://dragonlens.itch.io/were-live",
      },
    ],
    featured: true,
    tags: ["Streamer Simulator", "FPS", "Multitasking"],
    notes: ["Includes multiple in-game experiences with simulated chat dynamics"],
    releasedOn: "2023-12-01",
    sortPriority: 75,
  },
  // Beyond the Infernal Door: awaiting detailed data before adding to the list
];
