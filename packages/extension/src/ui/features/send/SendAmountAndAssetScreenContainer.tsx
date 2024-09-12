import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useDisclosure } from "@chakra-ui/react"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { routes } from "../../../shared/ui/routes"
import { SendAmountAndAssetNftScreenContainer } from "./SendAmountAndAssetNftScreenContainer"
import { SendAmountAndAssetTokenScreenContainer } from "./SendAmountAndAssetTokenScreenContainer"
import { useSendQuery } from "./useSendQuery"
import { useAccountOrContact } from "../accounts/useAccountOrContact"
import { selectedNetworkIdView } from "../../views/network"
import { useView } from "../../views/implementation/react"

export const SendAmountAndAssetScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { recipientAddress, tokenAddress, tokenId, returnTo, amount } =
    useSendQuery()
  const { contact, account } = useAccountOrContact(recipientAddress)

  const isExistingContactOrAccount = Boolean(contact) || Boolean(account)

  const {
    isOpen: isAddContactOpen,
    onOpen: onOpenAddContact,
    onClose: onCloseAddContact,
  } = useDisclosure()
  const selectedNetworkId = useView(selectedNetworkIdView)

  const onBack = useNavigateReturnToOrBack()
  const onCancel = () => navigate(routes.accountTokens(), { replace: true })

  const onSaveContact = () => {
    /** don't need to update address here - user cannot change it */
    onCloseAddContact()
  }

  const SendAmountAndAssetScreen = tokenId
    ? SendAmountAndAssetNftScreenContainer
    : SendAmountAndAssetTokenScreenContainer

  useEffect(() => {
    if (!recipientAddress) {
      /** Somehow got here with an invalid recipient */
      onBack()
    }
  }, [onBack, recipientAddress])

  if (!recipientAddress) {
    return null
  }

  return (
    <SendAmountAndAssetScreen
      amount={amount}
      recipientAddress={recipientAddress}
      tokenAddress={tokenAddress}
      tokenId={tokenId}
      onBack={onBack}
      onCancel={onCancel}
      onOpenAddContact={onOpenAddContact}
      returnTo={returnTo}
      isAddContactOpen={isAddContactOpen}
      onCloseAddContact={onCloseAddContact}
      selectedNetworkId={selectedNetworkId}
      onSaveContact={onSaveContact}
      showSaveAddressButton={!isExistingContactOrAccount}
    />
  )
}
