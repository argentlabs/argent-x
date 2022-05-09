import { number } from "starknet"

import { Account } from "./Account"

export async function checkIfUpgradeAvailable(
  account: Account,
  targetImplementation?: string,
): Promise<boolean> {
  if (!targetImplementation) {
    return false
  }
  const currentImplementation = await account.getCurrentImplementation()
  return !number
    .toBN(currentImplementation)
    .eq(number.toBN(targetImplementation))
}
