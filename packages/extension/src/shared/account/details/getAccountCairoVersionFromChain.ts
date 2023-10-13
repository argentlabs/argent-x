import { WalletAccount } from "../../wallet.model"
import { flatten, groupBy, toPairs } from "lodash-es"
import { networkService } from "../../network/service"
import { getAccountCairoVersion } from "../../utils/argentAccountVersion"

export type AccountCairoVersionFromChain = Pick<
  WalletAccount,
  "address" | "networkId" | "cairoVersion"
>

export async function getAccountCairoVersionFromChain(
  accounts: WalletAccount[],
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
              address: accs[i].address,
              networkId,
              cairoVersion: response,
            }
          })
          return result
        },
      ),
    ),
  )
}
