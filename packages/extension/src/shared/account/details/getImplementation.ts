import { Call, number } from "starknet"
import useSWR from "swr"

import { useArgentShieldEnabled } from "../../../ui/features/shield/useArgentShieldEnabled"
import { getMulticallForNetwork } from "../../multicall"
import { getNetwork } from "../../network"
import { BaseWalletAccount } from "../../wallet.model"
import { getAccountIdentifier } from "../../wallet.service"
import { uint256ToHexString } from "./util"

/**
 * Get implementation class hash of account
 */

export const getImplementationForAccount = async (
  account: BaseWalletAccount,
) => {
  const network = await getNetwork(account.networkId)
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_implementation",
  }
  const multicall = getMulticallForNetwork(network)
  const response = await multicall.call(call)
  return uint256ToHexString(response)
}

/**
 * Returns true if implementation class hash of account is included in the account network `accountClassHash`
 */

export const getIsCurrentImplementation = async (
  account: BaseWalletAccount,
) => {
  const network = await getNetwork(account.networkId)
  const currentImplementations = Object.values(network.accountClassHash || {})
  const accountImplementation = await getImplementationForAccount(account)
  const isCurrentImplementation = currentImplementations.some(
    (currentImplementation) =>
      number.toBN(currentImplementation).eq(number.toBN(accountImplementation)),
  )
  return isCurrentImplementation
}

/**
 * Returns result of `getIsCurrentImplementation` if shield is enabled and account is defined
 */

export const useCanEnableArgentShieldForAccount = (
  account?: BaseWalletAccount,
) => {
  const argentShieldEnabled = useArgentShieldEnabled()
  const { data: canEnableGuardianForAccount } = useSWR(
    argentShieldEnabled && account
      ? [getAccountIdentifier(account), "canEnableGuardianForAccount"]
      : null,
    () => account && getIsCurrentImplementation(account),
  )
  return canEnableGuardianForAccount
}
