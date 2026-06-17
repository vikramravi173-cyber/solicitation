/**
 * Curated stock imagery (Unsplash). Each is rendered behind a scrim and a
 * duotone filter so photographs read as part of the command-deck palette
 * rather than generic stock. URLs verified to resolve.
 */
const base = "https://images.unsplash.com";
const q = (id: string, w: number) =>
  `${base}/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const IMG = {
  // Washington Monument — federal gravitas (masthead)
  masthead: q("photo-1617581629397-a72507c3de9e", 1800),
  // Heavy-lift launch — aerospace / defense
  launch: q("photo-1541185933-ef5d8ed016c2", 900),
  // Microelectronics — dual-use hardware
  silicon: q("photo-1518770660439-4636190af475", 900),
  // Earth from orbit — space / ISR
  orbit: q("photo-1446776811953-b23d57bd21aa", 900),
};
