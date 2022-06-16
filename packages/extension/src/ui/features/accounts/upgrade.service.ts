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
  const LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_MAINNET =
    "0x01bd7ca87f139693e6681be2042194cf631c4e8d77027bf0ea9e6d55fc6018ac"
  const LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_GOERLI =
    "0x070a61892f03b34f88894f0fb9bb4ae0c63a53f5042f79997862d1dffb8d6a30"

  if (!hasNewDerivationPath(account.signer.derivationPath)) {
    if (account.network.id === "mainnet-alpha") {
      return !number
        .toBN(currentImplementation)
        .eq(number.toBN(LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_MAINNET))
    }
    if (account.network.id === "goerli-alpha") {
      return !number
        .toBN(currentImplementation)
        .eq(number.toBN(LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_GOERLI))
    }
    return false
  }

  return !number
    .toBN(currentImplementation)
    .eq(number.toBN(targetImplementation))
}
