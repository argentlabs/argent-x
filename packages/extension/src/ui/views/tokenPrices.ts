import { atom } from "jotai"
import { tokenPriceRepo } from "../../shared/token/__new/repository/tokenPrice"
import { atomFromRepo } from "./implementation/atomFromRepo"

const tokenPricesAtom = atomFromRepo(tokenPriceRepo)

export const tokenPricesView = atom(async (get) => {
  const tokenPrices = await get(tokenPricesAtom)
  return tokenPrices
})
