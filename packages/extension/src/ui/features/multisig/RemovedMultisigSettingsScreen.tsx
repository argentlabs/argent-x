import { ButtonCell, CellStack, H6, P4, SpacerCell } from "@argent/x-ui"
import { Center, Flex, Image } from "@chakra-ui/react"
import { FC, MouseEvent } from "react"

import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import { Multisig } from "./Multisig"
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
            accountAddress: multisig.address,
            networkId: multisig.networkId,
            backgroundColor: multisig.hidden ? "#333332" : undefined,
          })}
        />
      </Center>
      <CellStack>
        <Flex direction={"column"} justify="center" align="center">
          <H6>{accountName}</H6>
          <P4 fontWeight="bold" color={"white.50"}>
            You were removed from this multisig
          </P4>
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
