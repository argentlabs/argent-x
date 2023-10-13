import { isContractDeployed } from "@argent/shared"
import { getProvider } from "../../network"
import { WalletAccount } from "../../wallet.model"

export type AccountDeployStatusFromChain = Pick<
  WalletAccount,
  "address" | "networkId" | "needsDeploy"
>

export async function getAccountDeployStatusFromChain(
  accounts: WalletAccount[],
): Promise<AccountDeployStatusFromChain[]> {
  return Promise.all(
    accounts.map(async ({ address, networkId, network }) => {
      const isDeployed = await isContractDeployed(getProvider(network), address)

      return {
        address,
        networkId,
        needsDeploy: !isDeployed,
      }
    }),
  )
}
