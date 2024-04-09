import { FC } from "react"
import { NftDetails } from "@argent/x-ui"
import {
  useIndexedCollection,
  useIndexedNft,
} from "../../../accountNfts/useRemoteNft"

interface NftDetailsArgentXContainerProps {
  contractAddress: string
  tokenId?: string
  networkId: string
  safe?: boolean
  dataIndex: number
  totalData: number
  isDisabled?: boolean
  isDefaultNetwork?: boolean
  amount: bigint
  usdValue?: string
}

const NftDetailsArgentXContainer: FC<NftDetailsArgentXContainerProps> = ({
  networkId,
  contractAddress,
  tokenId,
  safe,
  dataIndex,
  totalData,
  isDisabled,
  isDefaultNetwork,
  amount,
  usdValue,
}) => {
  const { data: nft } = useIndexedNft(contractAddress, tokenId, networkId)
  const { data: collection } = useIndexedCollection(contractAddress, networkId)

  return (
    <NftDetails
      contractAddress={contractAddress}
      tokenId={tokenId}
      networkId={networkId}
      safe={safe}
      dataIndex={dataIndex}
      totalData={totalData}
      isDisabled={isDisabled}
      isDefaultNetwork={isDefaultNetwork}
      amount={amount}
      usdValue={usdValue}
      nft={nft ?? undefined}
      collection={collection ?? undefined}
    />
  )
}

export { NftDetailsArgentXContainer }
