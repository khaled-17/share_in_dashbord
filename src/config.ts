/**
 * App runtime config (API-only mode).
 */
export const APP_CONFIG = {
  DATA_SOURCE: "api" as const,

  get currentSource() {
    return "api" as const;
  },
};
