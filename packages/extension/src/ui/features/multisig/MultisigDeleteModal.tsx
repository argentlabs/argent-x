import { Button, H4, P2 } from "@argent/x-ui"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import type { FC, MouseEvent } from "react"

interface MultisigDeleteModalProps {
  isOpen: boolean
  onDelete?: (e?: MouseEvent<HTMLButtonElement>) => void | Promise<void>
  onClose: () => void
}

export const MultisigDeleteModal: FC<MultisigDeleteModalProps> = ({
  isOpen,
  onDelete,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700" borderRadius="2xl">
        <ModalHeader>
          <H4 fontWeight="600" textAlign="center">
            Are you sure?
          </H4>
        </ModalHeader>
        <ModalBody>
          <P2 fontWeight="400" textAlign="center">
            The multisig owner will not be able to add you to the multisig
            anymore
          </P2>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button
            w="100%"
            colorScheme="primary"
            onClick={(e) => {
              if (onDelete) {
                void onDelete(e)
              }
            }}
          >
            Delete
          </Button>
          <Button w="100%" backgroundColor="neutrals.600" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
