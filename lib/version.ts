// Version management system
export const APP_VERSION = "1.0.0";
export const LAST_UPDATED = new Date().toISOString();

// Version history
export const VERSION_HISTORY = [
  {
    version: "1.0.0",
    date: new Date().toISOString(),
    changes: ["Initial MVP release", "Core site structure", "Home and About pages"]
  }
];

export function getVersionInfo() {
  return {
    version: APP_VERSION,
    lastUpdated: LAST_UPDATED,
    buildDate: new Date().toISOString()
  };
}

