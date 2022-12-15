import { getNetworkSelector } from "../../../shared/account/selectors"
import { accountStore } from "../../../shared/account/store"
import { useAppState } from "../../app.state"

export const validateRemoveNetwork = async (networkId: string) => {
  const { switcherNetworkId } = useAppState.getState()
  if (switcherNetworkId === networkId) {
    throw new Error(
      `Network ${networkId} is the current network. Change networks before deleting.`,
    )
  }

  const accountsOnNetwork = await accountStore.get(
    getNetworkSelector(networkId),
  )
  if (accountsOnNetwork.length) {
    throw new Error(
      `Network ${networkId} has ${accountsOnNetwork.length} account${
        accountsOnNetwork.length === 1 ? "" : "s"
      } which must be removed before the network can be deleted.`,
    )
  }

  return true
}
