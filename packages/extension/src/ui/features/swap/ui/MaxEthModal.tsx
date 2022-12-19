import { Button, H5, P3 } from "@argent/ui"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"

interface MaxEthModalProps {
  isOpen: boolean
  onMax?: () => void
  onClose: () => void
}

const MaxEthModal: FC<MaxEthModalProps> = ({ isOpen, onMax, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Sell Max ETH?
          </H5>
        </ModalHeader>
        <ModalBody>
          <P3 fontWeight="400" textAlign="center">
            ETH is required to pay fees so we recommend having ETH in your
            wallet to complete transactions
          </P3>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button w="100%" colorScheme="primary" onClick={onMax}>
            Use Max ETH
          </Button>
          <Button w="100%" colorScheme="neutrals" onClick={onClose}>
            Choose different amount
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export { MaxEthModal }
