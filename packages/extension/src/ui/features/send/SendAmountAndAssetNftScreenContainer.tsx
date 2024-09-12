import { addressSchema } from "@argent/x-shared"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useNft } from "../accountNfts/nfts.state"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { NftInput } from "./NftInput"
import {
  SendAmountAndAssetScreen,
  SendAmountAndAssetScreenProps,
} from "./SendAmountAndAssetScreen"
import { clientNftService } from "../../services/nfts"
import { delay } from "../../../shared/utils/delay"

export const SendAmountAndAssetNftScreenContainer: FC<
  SendAmountAndAssetScreenProps
> = ({ onCancel, returnTo, ...rest }) => {
  const navigate = useNavigate()
  const account = useView(selectedAccountView)
  const network = useCurrentNetwork()
  const { recipientAddress, tokenAddress, tokenId } = rest
  const nft = useNft(addressSchema.parse(tokenAddress), tokenId)
  const onSubmit = useCallback(async () => {
    if (account && nft && recipientAddress && tokenAddress && tokenId) {
      await clientNftService.transferNft(
        network,
        nft,
        account.address,
        recipientAddress,
      )
      /**
       * wait for store state to propagate into the ui and show the action screen
       * otherwise the user will see a flash of the token screen here
       */
      await delay(0)
    }
    onCancel()
  }, [account, network, nft, onCancel, recipientAddress, tokenAddress, tokenId])

  const onTokenClick = useCallback(() => {
    navigate(
      routes.sendAssetScreen({
        recipientAddress,
        tokenAddress,
        tokenId,
        returnTo,
      }),
    )
  }, [navigate, recipientAddress, returnTo, tokenAddress, tokenId])

  if (!nft || !account) {
    return null
  }
  return (
    <SendAmountAndAssetScreen
      {...rest}
      onCancel={onCancel}
      onSubmit={onSubmit}
      input={
        <NftInput
          contractAddress={nft.contract_address}
          tokenId={nft.token_id}
          networkId={account?.networkId}
          onClick={onTokenClick}
        />
      }
    />
  )
}
