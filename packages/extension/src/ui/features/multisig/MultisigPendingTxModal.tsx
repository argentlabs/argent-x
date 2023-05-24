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

interface MultisigPendingTxModalProps {
  isOpen: boolean
  onConfirm: (e: MouseEvent<HTMLButtonElement>) => void
  onClose: () => void
  noOfOwners: number
}

export const MultisigPendingTxModal: FC<MultisigPendingTxModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  noOfOwners,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.800" borderRadius="2xl" maxW="72">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Multiple pending transactions, only one can be valid
          </H5>
        </ModalHeader>
        <ModalBody>
          <P3 fontWeight="400" textAlign="center">
            The first transaction to be confirmed by {noOfOwners} owners will be
            valid.The rest will get cancelled
          </P3>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button w="100%" colorScheme="primary" onClick={onConfirm}>
            Confirm anyway
          </Button>
          <Button
            w="100%"
            backgroundColor="neutrals.700"
            _hover={{ backgroundColor: "neutrals.600" }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
