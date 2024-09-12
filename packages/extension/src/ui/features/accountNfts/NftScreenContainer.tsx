import { isAddress } from "@argent/x-shared"
import { AlertDialog, BarBackButton, NavigationContainer } from "@argent/x-ui"
import { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { nftService } from "../../../shared/nft"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { NftScreen } from "./NftScreen"
import { useRemoteNft } from "./useRemoteNft"
import { useDisclosure } from "@chakra-ui/react"
import { genericErrorSchema } from "../actions/feeEstimation/feeError"

export const NftScreenContainer: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [message, setMessage] = useState("")
  const navigate = useNavigate()
  const { contractAddress, tokenId } = useParams()
  const account = useView(selectedAccountView)
  const network = useCurrentNetwork()
  const { data: nft } = useRemoteNft(contractAddress, tokenId, network.id)

  const onViewNft = async () => {
    if (!nft) {
      return
    }
    try {
      const url = await nftService.getNftMarketplaceUrl(nft, network.id)
      window.open(url, "_blank")?.focus()
    } catch (e) {
      const genericError = genericErrorSchema.safeParse(e)
      if (genericError.success) {
        setMessage(genericError.data.message)
      } else {
        setMessage("Unable to view NFT")
      }
      onOpen()
    }
  }

  const onSendNft = () => {
    if (!isAddress(contractAddress)) {
      return
    }
    navigate(
      routes.sendRecipientScreen({
        tokenAddress: contractAddress,
        tokenId,
      }),
    )
  }

  if (!account || !contractAddress || !tokenId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!nft) {
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
        title="Not found"
      />
    )
  }

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        title={"Error"}
        message={message}
        onCancel={onClose}
      />
      <NftScreen nft={nft} onViewNft={onViewNft} onSendNft={onSendNft} />
    </>
  )
}
