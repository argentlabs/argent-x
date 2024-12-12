import { BarCloseButton } from "@argent/x-ui"
import type { DrawerProps } from "@chakra-ui/react"
import type { FC } from "react"
import { Suspense } from "react"

import { ModalSheet } from "../../components/ModalSheet"
import type { AddressBookAddOrEditScreenContainerProps } from "../settings/addressBook/AddressBookAddOrEditScreenContainer"
import { AddressBookAddOrEditScreenContainer } from "../settings/addressBook/AddressBookAddOrEditScreenContainer"

interface SendModalAddContactScreenProps
  extends Omit<DrawerProps, "children">,
    Pick<
      AddressBookAddOrEditScreenContainerProps,
      "contact" | "onSave" | "addressDisabled"
    > {}

/** TODO: BLO-1319 - refactor so e.g. this into a router-route that can be invoked from any component */

export const SendModalAddContactScreen: FC<SendModalAddContactScreenProps> = ({
  contact,
  onSave,
  onClose,
  addressDisabled,
  ...rest
}) => {
  return (
    <ModalSheet {...rest} onClose={onClose}>
      <Suspense fallback={null}>
        <AddressBookAddOrEditScreenContainer
          contact={contact}
          networkDisabled
          onCancel={onClose}
          leftButton={null}
          rightButton={<BarCloseButton onClick={onClose} />}
          onSave={onSave}
          addressDisabled={addressDisabled}
        />
      </Suspense>
    </ModalSheet>
  )
}
