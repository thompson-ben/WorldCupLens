/**
 * @worldcuplens/core — tournament-agnostic domain model and simulation engine.
 *
 * Nothing here knows about a specific competition: tournaments are described by
 * data ({@link Tournament} + {@link FormatConfig}) and simulated by composable
 * format strategies driven by a pluggable match model.
 */
export * from "./domain/index.js";
export * from "./formats/index.js";
export * from "./simulation/index.js";
