import {
  BarBackButton,
  ButtonCell,
  CellStack,
  H6,
  NavigationContainer,
  P4,
  SpacerCell,
} from "@argent/ui"
import { Center, Flex, Image, useDisclosure } from "@chakra-ui/react"
import React, { FC, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { hidePendingMultisig } from "../../../shared/multisig/utils/pendingMultisig"
import { routes, useReturnTo } from "../../routes"
import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { usePendingMultisig } from "./multisig.state"
import { MultisigHideModal } from "./MultisigDeleteModal"

export const JoinMultisigSettingsScreen: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const { publicKey = "" } = useParams<"publicKey">()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const pendingMultisig = usePendingMultisig({
    publicKey: publicKey,
    networkId: currentNetwork.id,
  })
  const accountName = pendingMultisig
    ? pendingMultisig.name
    : "Unnamed Multisig"

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()

  const onHideConfirm = useCallback(async () => {
    if (pendingMultisig) {
      await hidePendingMultisig(pendingMultisig)
      onDeleteModalClose()
      navigate(routes.accounts())
    }
  }, [navigate, onDeleteModalClose, pendingMultisig])

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title={accountName}
      >
        <Center p={4} pb={2}>
          <Image
            borderRadius={"full"}
            width={20}
            height={20}
            src={getNetworkAccountImageUrl({
              accountName,
              accountAddress: publicKey,
              networkId: currentNetwork.id,
              backgroundColor: pendingMultisig?.hidden ? "#333332" : undefined,
            })}
          />
        </Center>
        <CellStack>
          <Flex direction={"column"} justify="center" align="center">
            <H6>{accountName}</H6>
            <P4 fontWeight="bold" color={"white50"}>
              Awaiting owner to finish setup
            </P4>
          </Flex>
          <SpacerCell />

          <ButtonCell
            color={"error.500"}
            _hover={{ color: "error.500" }}
            onClick={onDeleteModalOpen}
          >
            Hide account
          </ButtonCell>
        </CellStack>
      </NavigationContainer>
      <MultisigHideModal
        onClose={onDeleteModalClose}
        isOpen={isDeleteModalOpen}
        onHide={onHideConfirm}
        multisigType="pending"
      />
    </>
  )
}
