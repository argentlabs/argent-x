import { isNumeric } from "../../../shared/utils/number"

export const isAllowedNumericInputValue = (value: string, maxDecimals = 16) => {
  const numericalRegex = new RegExp(`^[0-9]*.?[0-9]{0,${maxDecimals}}$`)
  if (value === "") {
    return true
  }
  if (!isNumeric(value)) {
    return false
  }
  if (numericalRegex.test(value)) {
    return true
  }
  return false
}
