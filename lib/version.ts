// Version management system
export const APP_VERSION = "1.0.0";
// Use a fixed date to avoid hydration mismatches
// Update this manually when deploying new versions
export const LAST_UPDATED = "2025-01-27T00:00:00.000Z";

// Version history
export const VERSION_HISTORY = [
  {
    version: "1.0.0",
    date: "2025-01-27T00:00:00.000Z",
    changes: ["Initial MVP release", "Core site structure", "Home and About pages", "Design system with animations and sound effects"]
  }
];

export function getVersionInfo() {
  return {
    version: APP_VERSION,
    lastUpdated: LAST_UPDATED,
    buildDate: typeof window !== 'undefined' ? new Date().toISOString() : LAST_UPDATED
  };
}

