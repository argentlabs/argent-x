import { Button, H5, P3 } from "@argent/ui"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC, MouseEvent } from "react"

interface MaxEthModalProps {
  isOpen: boolean
  onDelete?: (e: MouseEvent<HTMLButtonElement>) => Promise<void>
  onClose: () => void
}

export const MultisigDeleteModal: FC<MaxEthModalProps> = ({
  isOpen,
  onDelete,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Are you sure?
          </H5>
        </ModalHeader>
        <ModalBody>
          <P3 fontWeight="400" textAlign="center">
            The multisig owner can still add you to the multisig if you shared
            your signer key with them
          </P3>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button w="100%" colorScheme="primary" onClick={onDelete}>
            Delete
          </Button>
          <Button w="100%" colorScheme="neutrals" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
