import { BarCloseButton } from "@argent/ui"
import { DrawerProps } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { ModalSheet } from "../../components/ModalSheet"
import {
  AddressBookAddOrEditScreenContainer,
  AddressBookAddOrEditScreenContainerProps,
} from "../settings/AddressBookAddOrEditScreenContainer"

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
