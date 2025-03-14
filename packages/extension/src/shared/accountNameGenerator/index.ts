import { AccountNameGenerator } from "@argent/x-shared"
import memoize from "memoizee"
import type { AccountId, WalletAccountType } from "../wallet.model"
import {
  deserializeAccountIdentifier,
  getAccountIdentifier__old,
} from "../utils/accountIdentifier"

export const accountNameGenerator = new AccountNameGenerator()

const generateAccountMeta = memoize(
  (seed: string) => accountNameGenerator.generate(seed),
  { primitive: true },
)

export const getAccountMeta = (
  accountId: AccountId,
  accountType: WalletAccountType,
) => {
  let seed = accountId
  if (accountType === "multisig") {
    const { address, networkId } = deserializeAccountIdentifier(accountId)
    seed = getAccountIdentifier__old(address, networkId)
  }
  return generateAccountMeta(seed)
}
