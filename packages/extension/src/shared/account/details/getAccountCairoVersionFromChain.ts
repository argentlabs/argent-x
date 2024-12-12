import type { ArgentWalletAccount } from "../../wallet.model"
import { flatten, groupBy, toPairs } from "lodash-es"
import { networkService } from "../../network/service"
import { getAccountCairoVersion } from "../../utils/argentAccountVersion"

export type AccountCairoVersionFromChain = Pick<
  ArgentWalletAccount,
  "id" | "address" | "networkId" | "cairoVersion"
>

export async function getAccountCairoVersionFromChain(
  accounts: ArgentWalletAccount[],
): Promise<AccountCairoVersionFromChain[]> {
  const accountsByNetwork = toPairs(groupBy(accounts, (a) => a.networkId))

  return flatten(
    await Promise.all(
      accountsByNetwork.map(
        async ([networkId, accs]): Promise<AccountCairoVersionFromChain[]> => {
          const network = await networkService.getById(networkId)
          const responses = await Promise.all(
            accs.map((acc) =>
              getAccountCairoVersion(acc.address, network, acc.type),
            ),
          )

          const result = responses.map((response, i) => {
            return {
              id: accs[i].id,
              address: accs[i].address,
              networkId,
              cairoVersion: response || accs[i].cairoVersion, // If the onchain call fails, keep the cached one
            }
          })
          return result
        },
      ),
    ),
  )
}
