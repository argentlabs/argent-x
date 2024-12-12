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

interface HighPriceImpactModalProps {
  isOpen: boolean
  onAccept?: () => void
  onClose: () => void
}

const HighPriceImpactModal: FC<HighPriceImpactModalProps> = ({
  isOpen,
  onAccept,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700">
        <ModalHeader>
          <H4 fontWeight="600" textAlign="center">
            High Price Impact
          </H4>
        </ModalHeader>
        <ModalBody>
          <P2 fontWeight="400" textAlign="center">
            This trade has a price impact greater than 3%. This will result in
            you receiving significantly less than you paid. Are you sure you
            want to continue?
          </P2>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button w="100%" colorScheme="primary" onClick={onClose}>
            Choose different amount
          </Button>
          <Button w="100%" colorScheme="neutrals" onClick={onAccept}>
            Ignore and continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export { HighPriceImpactModal }
