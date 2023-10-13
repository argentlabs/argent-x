import { addressSchema } from "@argent/shared"
import { BarBackButton, BarCloseButton } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { CollectionNfts } from "../accountNfts/CollectionNfts"
import { useCollection, useCollectionNfts } from "../accountNfts/nfts.state"
import { useSendQuery } from "./schema"

export const SendCollectionNftsScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { recipientAddress, tokenAddress, tokenId, amount, returnTo } =
    useSendQuery()

  const collection = useCollection(addressSchema.parse(tokenAddress))
  const nfts = useCollectionNfts(
    addressSchema.parse(collection?.contractAddress),
  )

  return (
    <CollectionNfts
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton
          onClick={() => {
            /**
             * TODO: refactor - intention here is to go 'back' to the most recent 'SendAssetScreen' in the history stack
             *
             * Useful to have some helper function that can e.g. navigateBack(routes.sendAssetScreen.path)
             * This would find the most recent entry in the history stack, then navigate minus the number of steps to get there
             */
            navigate(-2)
          }}
        />
      }
      collection={collection}
      nfts={nfts}
      onNftClick={(nft) => {
        navigate(
          routes.sendAmountAndAssetScreen({
            recipientAddress,
            tokenAddress,
            tokenId: nft.token_id,
            returnTo,
          }),
        )
      }}
    />
  )
}
