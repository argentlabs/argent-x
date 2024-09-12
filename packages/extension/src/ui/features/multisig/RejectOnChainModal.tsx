import { H5, P3 } from "@argent/x-ui"
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"
import { A } from "../../components/TrackingLink"

interface RejectOnChainModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const RejectOnChainModal: FC<RejectOnChainModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700" borderRadius="2xl">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Are you sure?
          </H5>
        </ModalHeader>
        <ModalBody>
          <P3 fontWeight="400" textAlign="center">
            Rejecting this transaction onchain will require confirmation by the
            multisig owners.
          </P3>
          <P3
            fontWeight="400"
            textAlign="center"
            color="primary.500"
            cursor={"pointer"}
          >
            <A
              href={
                "https://support.argent.xyz/hc/en-us/articles/19485184697245-Transaction-queueing-on-multisig"
              }
              targetBlank
            >
              Learn more
            </A>
          </P3>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button w="100%" colorScheme="primary" onClick={onConfirm}>
            Yes, reject this transaction
          </Button>
          <Button w="100%" backgroundColor="neutrals.600" onClick={onClose}>
            No thanks
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
