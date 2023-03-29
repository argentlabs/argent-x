import useSWR from "swr"

import { getMultisigRequestData } from "../../../../shared/multisig/multisig.service"
import { networkToStarknetNetwork } from "../../../../shared/utils/starknetNetwork"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { Account } from "../../accounts/Account"

export const useMultisigRequest = ({
  account,
  requestId,
}: {
  account?: Account
  requestId?: string
}) => {
  return useSWR(
    [
      account ? getAccountIdentifier(account) : "",
      "multisigRequest",
      requestId,
    ],
    async () => {
      if (!account || !requestId) {
        return undefined
      }
      const request = await getMultisigRequestData({
        address: account.address,
        networkId: networkToStarknetNetwork(account.network),
        requestId: requestId,
      })
      return request
    },
  )
}
