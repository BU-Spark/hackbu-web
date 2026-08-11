/**
 * Track metadata. A bounty's `track` says who is behind it — `hackbu` is the
 * BU IS&T collaboration, which is one track on the board rather than the board
 * itself. `variant` picks the badge treatment (see src/styles/redesign.css).
 */
export const TRACKS = {
  hackbu: { label: 'HackBU · IS&T', variant: 'accent', sponsor: 'BU IS&T' },
  spark: { label: 'Spark!', variant: 'neutral', sponsor: 'BU Spark!' },
  partner: { label: 'Partner', variant: 'outline', sponsor: '' },
} as const;

export type TrackId = keyof typeof TRACKS;

export const TRACK_IDS = Object.keys(TRACKS) as TrackId[];

export function track(id: string | undefined) {
  return TRACKS[(id ?? 'hackbu') as TrackId] ?? TRACKS.hackbu;
}
