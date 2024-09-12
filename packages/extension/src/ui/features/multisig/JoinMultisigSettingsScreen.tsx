import {
  BarBackButton,
  ButtonCell,
  CellStack,
  H6,
  NavigationContainer,
  P4,
  SpacerCell,
} from "@argent/x-ui"
import { Center, Flex, Image, useDisclosure } from "@chakra-ui/react"
import React, { FC, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import {
  deletePendingMultisig,
  hidePendingMultisig,
} from "../../../shared/multisig/utils/pendingMultisig"
import { useReturnTo } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { usePendingMultisig } from "./multisig.state"
import { MultisigHideModal } from "./MultisigHideModal"
import { MultisigDeleteModal } from "./MultisigDeleteModal"

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

  const {
    isOpen: isHideModalOpen,
    onOpen: onHideModalOpen,
    onClose: onHideModalClose,
  } = useDisclosure()

  const onHideConfirm = useCallback(async () => {
    if (pendingMultisig) {
      await hidePendingMultisig(pendingMultisig)
      onHideModalClose()
      navigate(routes.accounts())
    }
  }, [navigate, onHideModalClose, pendingMultisig])

  const onDeleteConfirm = useCallback(async () => {
    if (pendingMultisig) {
      await deletePendingMultisig(pendingMultisig)
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
            <P4 fontWeight="bold" color={"white.50"}>
              Awaiting owner to finish setup
            </P4>
          </Flex>
          <SpacerCell />

          <ButtonCell
            color={"error.500"}
            _hover={{ color: "error.500" }}
            onClick={onHideModalOpen}
          >
            Hide account
          </ButtonCell>
          <ButtonCell
            color={"error.500"}
            _hover={{ color: "error.500" }}
            onClick={onDeleteModalOpen}
          >
            Delete account
          </ButtonCell>
        </CellStack>
      </NavigationContainer>
      <MultisigDeleteModal
        onClose={onDeleteModalClose}
        isOpen={isDeleteModalOpen}
        onDelete={onDeleteConfirm}
      />
      <MultisigHideModal
        onClose={onHideModalClose}
        isOpen={isHideModalOpen}
        onHide={onHideConfirm}
        multisigType="pending"
      />
    </>
  )
}
