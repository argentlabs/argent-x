import { Button, H5, P3 } from "@argent/x-ui"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"

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
          <H5 fontWeight="600" textAlign="center">
            Remove owner?
          </H5>
        </ModalHeader>
        <ModalBody>
          <P3 textAlign="center">
            Are you sure you want to remove this multisig owner?
          </P3>
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
          <Button w="100%" colorScheme="neutrals" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
