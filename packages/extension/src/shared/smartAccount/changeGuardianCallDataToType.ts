import type { Call, Calldata } from "starknet"
import { CairoOptionVariant, CallData, constants, num } from "starknet"

export enum ChangeGuardian {
  /** Guardian is not being changed */
  NONE = "NONE",
  /** Guardian is being added */
  ADDING = "ADDING",
  /** Guardian is being removed */
  REMOVING = "REMOVING",
}

export const changeGuardianTransactionsToType = (
  transactions?: Call | Call[],
) => {
  const calldata = Array.isArray(transactions)
    ? transactions[0].calldata
    : transactions?.calldata

  const compiledCalldata = CallData.toCalldata(calldata)
  return changeGuardianCalldataToType(compiledCalldata)
}

export const changeGuardianCalldataToType = (calldata?: Calldata) => {
  if (!calldata?.length) {
    return ChangeGuardian.NONE
  }
  // last entry is the guardian or CairoOptionVariant
  const calldataElement = calldata[calldata.length - 1]
  const guardianAddress = num.toBigInt(calldataElement)
  if (
    guardianAddress === constants.ZERO ||
    calldataElement === CairoOptionVariant.None.toString()
  ) {
    return ChangeGuardian.REMOVING
  } else {
    return ChangeGuardian.ADDING
  }
}
