/**
 * Sports the platform can model. Kept as a string-union so new sports can be
 * added without touching the simulation engine, which is sport-agnostic.
 */
export type Sport = "football" | "basketball" | "rugby" | "hockey" | "cricket";
