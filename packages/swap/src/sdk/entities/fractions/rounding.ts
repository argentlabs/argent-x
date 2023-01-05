export const enum RoundingMode {
  /**
   * Rounds towards zero.
   * I.e. truncate, no rounding.
   */
  RoundDown = 0,
  /**
   * Rounds towards nearest neighbour.
   * If equidistant, rounds away from zero.
   */
  RoundHalfUp = 1,
  /**
   * Rounds towards nearest neighbour.
   * If equidistant, rounds towards even neighbour.
   */
  RoundHalfEven = 2,
  /**
   * Rounds away from zero.
   */
  RoundUp = 3,
}
