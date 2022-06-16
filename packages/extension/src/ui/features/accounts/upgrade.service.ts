import { number } from "starknet"

import { hasNewDerivationPath } from "../../../shared/wallet.service"
import { Account } from "./Account"

export async function checkIfUpgradeAvailable(
  account: Account,
  targetImplementation?: string,
): Promise<boolean> {
  if (!targetImplementation) {
    return false
  }

  const currentImplementation = await account.getCurrentImplementation()

  // FIXME: remove when we dont want to support old accounts anymore
  const LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS =
    "0x01bd7ca87f139693e6681be2042194cf631c4e8d77027bf0ea9e6d55fc6018ac"
  if (!hasNewDerivationPath(account.signer.derivationPath)) {
    return !number
      .toBN(currentImplementation)
      .eq(number.toBN(LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS))
  }

  return !number
    .toBN(currentImplementation)
    .eq(number.toBN(targetImplementation))
}
