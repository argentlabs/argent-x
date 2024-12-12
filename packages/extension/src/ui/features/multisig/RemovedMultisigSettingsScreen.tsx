import { ButtonCell, CellStack, H5, P3, SpacerCell } from "@argent/x-ui"
import { Center, Flex, Image } from "@chakra-ui/react"
import type { FC, MouseEvent } from "react"

import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import type { Multisig } from "./Multisig"
import { MultisigHideModal } from "./MultisigHideModal"

export interface RemovedMultisigSettingsScreenProps {
  multisig: Multisig
  accountName: string
  onHideMultisigModalOpen: () => void
  onHideMultisigModalClose: () => void
  onHideConfirm: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>
  isHideMultisigModalOpen: boolean
}

export const RemovedMultisigSettingsScreen: FC<
  RemovedMultisigSettingsScreenProps
> = ({
  multisig,
  accountName,
  onHideMultisigModalClose,
  onHideMultisigModalOpen,
  isHideMultisigModalOpen,
  onHideConfirm,
}) => {
  return (
    <>
      <Center p={4} pb={2}>
        <Image
          borderRadius={"full"}
          width={20}
          height={20}
          src={getNetworkAccountImageUrl({
            accountName,
            accountId: multisig.id,
            backgroundColor: multisig.hidden ? "#333332" : undefined,
          })}
        />
      </Center>
      <CellStack>
        <Flex direction={"column"} justify="center" align="center">
          <H5>{accountName}</H5>
          <P3 fontWeight="bold" color={"white.50"}>
            You were removed from this multisig
          </P3>
        </Flex>
        <SpacerCell />

        <ButtonCell
          colorScheme={"neutrals-danger"}
          onClick={onHideMultisigModalOpen}
        >
          Hide account
        </ButtonCell>
      </CellStack>
      <MultisigHideModal
        onClose={onHideMultisigModalClose}
        isOpen={isHideMultisigModalOpen}
        onHide={onHideConfirm}
        multisigType="active"
      />
    </>
  )
}
