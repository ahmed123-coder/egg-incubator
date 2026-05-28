export const INCUBATION_DAYS = 21;

export const DEFAULT_TEMPERATURE_C = 37.5;
export const DEFAULT_HUMIDITY_PCT = 55;

export const POLLING_INTERVAL_MS = 5000;

export const API_PATHS = {
  sensor: "/api/sensor",
  dashboard: "/api/dashboard",
  sessions: "/api/sessions",
  settings: "/api/settings",
} as const;
