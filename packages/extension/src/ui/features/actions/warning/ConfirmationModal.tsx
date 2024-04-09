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
      <ModalContent background="neutrals.700" borderRadius="2xl">
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

        <ModalFooter flexDirection="column" gap="3">
          <Button w="100%" colorScheme="danger" onClick={onConfirm}>
            Confirm
          </Button>
          <Button w="100%" backgroundColor="neutrals.600" onClick={onClose}>
            Go back
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
