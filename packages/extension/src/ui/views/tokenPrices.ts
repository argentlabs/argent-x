import { atomFamily } from "jotai/utils"
import { atom } from "jotai"
import { tokenBalanceRepo } from "../../shared/token/__new/repository/tokenBalance"
import { tokenPriceRepo } from "../../shared/token/__new/repository/tokenPrice"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/utils/accountsEqual"

const tokenPricesAtom = atomFromRepo(tokenPriceRepo)

export const tokenPricesView = atom(async (get) => {
  const tokenPrices = await get(tokenPricesAtom)
  return tokenPrices
})
