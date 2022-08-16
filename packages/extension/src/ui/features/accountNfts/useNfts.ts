import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { isEqualAddress } from "../../services/addresses"
import { SWRConfigCommon } from "../../services/swr"
import { AspectNft } from "./aspect.model"
import { fetchAspectNfts } from "./aspect.service"

export const useNfts = (
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { data: nfts = [], ...rest } = useSWR(
    account && [getAccountIdentifier(account), "nfts"],
    () => account && fetchAspectNfts(account),
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { nfts, ...rest }
}

interface IGetNft {
  nfts?: AspectNft[]
  contractAddress: string
  tokenId: string
}

export const getNft = ({ nfts, contractAddress, tokenId }: IGetNft) => {
  if (!nfts) {
    return
  }
  const nft = nfts.find(
    ({ contract_address, token_id }) =>
      isEqualAddress(contract_address, contractAddress) && token_id === tokenId,
  )
  return nft
}
