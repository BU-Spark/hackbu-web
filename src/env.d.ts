/// <reference path="../.astro/types.d.ts" />

declare var umami: {
  track(event: string, data?: Record<string, string | number>): void;
};