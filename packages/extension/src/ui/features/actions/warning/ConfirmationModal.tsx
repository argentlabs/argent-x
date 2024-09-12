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

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent color="text-primary" bg="surface-elevated" rounded="2xl">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Dangerous transaction!
          </H5>
        </ModalHeader>
        <ModalBody>
          <P3 fontWeight="400" textAlign="center">
            By confirming this transaction you are exposing your wallet to a
            serious risk
          </P3>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="2">
          <Button colorScheme="danger" size="sm" w="full" onClick={onConfirm}>
            Confirm
          </Button>
          <Button colorScheme="secondary" size="sm" w="full" onClick={onClose}>
            Go back
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
