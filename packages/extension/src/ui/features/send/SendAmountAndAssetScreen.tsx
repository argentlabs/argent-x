import {
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  HeaderCell,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

import { AccountAddressListItem } from "../accounts/AccountAddressListItem"
import { SendQuery } from "./schema"
import { SendModalAddContactScreen } from "./SendModalAddContactScreen"
import { AddressBookContact } from "../../../shared/addressBook/type"

const { AddressBookIcon } = icons

export interface SendAmountAndAssetScreenProps extends SendQuery {
  input?: ReactNode
  isAddContactOpen: boolean
  isInvalid?: boolean
  onBack: () => void
  onCancel: () => void
  onCloseAddContact: () => void
  onOpenAddContact?: () => void
  onSaveContact: (contact: AddressBookContact) => void
  onSubmit?: () => void
  submitButtonError?: string
  switcherNetworkId: string
  showSaveAddressButton: boolean
}

export const SendAmountAndAssetScreen: FC<SendAmountAndAssetScreenProps> = ({
  input,
  isAddContactOpen,
  isInvalid,
  onBack,
  onCancel,
  onCloseAddContact,
  onOpenAddContact,
  onSaveContact,
  onSubmit,
  recipientAddress,
  submitButtonError,
  switcherNetworkId,
  showSaveAddressButton,
}) => {
  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onBack} />}
        rightButton={<BarCloseButton onClick={onCancel} />}
        title={"Send"}
      >
        <CellStack pt={0} flex={1}>
          <HeaderCell>Asset</HeaderCell>
          {input}
          <HeaderCell>Recipient</HeaderCell>
          {recipientAddress && (
            <AccountAddressListItem
              accountAddress={recipientAddress}
              onClick={onBack}
            />
          )}
          {showSaveAddressButton && (
            <Button
              size={"sm"}
              colorScheme={"transparent"}
              mx={"auto"}
              leftIcon={<AddressBookIcon />}
              color="neutrals.400"
              onClick={onOpenAddContact}
            >
              Save address
            </Button>
          )}
          <Flex flex={1} />
          <Button
            colorScheme={submitButtonError ? "error" : "primary"}
            isDisabled={isInvalid}
            onClick={onSubmit}
          >
            {submitButtonError ?? `Review send`}
          </Button>
        </CellStack>
      </NavigationContainer>
      <SendModalAddContactScreen
        contact={{ address: recipientAddress, networkId: switcherNetworkId }}
        isOpen={isAddContactOpen}
        onClose={onCloseAddContact}
        onSave={onSaveContact}
        addressDisabled
      />
    </>
  )
}
