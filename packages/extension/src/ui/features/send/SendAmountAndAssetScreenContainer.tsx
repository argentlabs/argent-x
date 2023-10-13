import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useDisclosure } from "@chakra-ui/react"
import { useAppState } from "../../app.state"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { routes } from "../../routes"
import { SendAmountAndAssetNftScreenContainer } from "./SendAmountAndAssetNftScreenContainer"
import { SendAmountAndAssetTokenScreenContainer } from "./SendAmountAndAssetTokenScreenContainer"
import { useSendQuery } from "./schema"
import { useAccountOrContact } from "../accounts/useAccountOrContact"

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
  const { switcherNetworkId } = useAppState()

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
      switcherNetworkId={switcherNetworkId}
      onSaveContact={onSaveContact}
      showSaveAddressButton={!isExistingContactOrAccount}
    />
  )
}
