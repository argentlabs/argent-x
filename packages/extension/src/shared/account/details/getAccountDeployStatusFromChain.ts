import { isContractDeployed } from "@argent/x-shared"
import { getProvider } from "../../network"
import type { ArgentWalletAccount } from "../../wallet.model"

export type AccountDeployStatusFromChain = Pick<
  ArgentWalletAccount,
  "id" | "address" | "networkId" | "needsDeploy"
>

export async function getAccountDeployStatusFromChain(
  accounts: ArgentWalletAccount[],
): Promise<AccountDeployStatusFromChain[]> {
  return Promise.all(
    accounts.map(async ({ address, networkId, network, id }) => {
      const isDeployed = await isContractDeployed(getProvider(network), address)

      return {
        id,
        address,
        networkId,
        needsDeploy: !isDeployed,
      }
    }),
  )
}
