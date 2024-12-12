import { Button, H4, P2 } from "@argent/x-ui"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import type { FC } from "react"

interface MultisigRemoveOwnerProps {
  isOpen: boolean
  onClose: () => void
  signerKey: string
  onRemove: () => void
}

export const MultisigRemoveOwnerModal: FC<MultisigRemoveOwnerProps> = ({
  isOpen,
  onClose,
  onRemove,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700">
        <ModalHeader>
          <H4 fontWeight="600" textAlign="center">
            Remove owner?
          </H4>
        </ModalHeader>
        <ModalBody>
          <P2 textAlign="center">
            Are you sure you want to remove this multisig owner?
          </P2>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button
            w="100%"
            colorScheme="primary"
            onClick={() => {
              onClose()
              onRemove()
            }}
          >
            Remove
          </Button>
          <Button w="100%" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
