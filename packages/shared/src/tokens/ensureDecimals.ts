/** ensure decimal value is numeric or 18 - avoid unintentially converting 0 to 18 */

import { isNumeric } from "../utils/number"

export const ensureDecimals = (decimals: unknown) => {
  if (isNumeric(decimals)) {
    return Number(decimals)
  }
  return 18
}
