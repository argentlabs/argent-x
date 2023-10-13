import { camelCase, snakeCase } from "lodash-es"
import { CairoVersion } from "starknet"

export const getEntryPointSafe = (
  entryPoint: string,
  cairoVersion: CairoVersion,
) => {
  if (cairoVersion === "1") {
    return snakeCase(entryPoint)
  }
  return camelCase(entryPoint)
}
