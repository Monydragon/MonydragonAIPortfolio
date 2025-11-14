// Version management system
export const APP_VERSION = "1.0.0";
// Use a fixed date to avoid hydration mismatches
// Update this manually when deploying new versions
// Format: yyyy-mm-dd
export const LAST_UPDATED = "2025-11-13";

// Version history
export const VERSION_HISTORY = [
  {
    version: "1.0.0",
    date: "2025-11-13",
    changes: ["Initial MVP release", "Core site structure", "Home and About pages", "Design system with animations and sound effects"]
  }
];

export function getVersionInfo() {
  return {
    version: APP_VERSION,
    lastUpdated: LAST_UPDATED,
    buildDate: LAST_UPDATED
  };
}

