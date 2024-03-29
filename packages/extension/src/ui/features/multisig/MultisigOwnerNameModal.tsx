import { Button, H5, Input } from "@argent/x-ui"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC, useState } from "react"

interface MultisigOwnerNameProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (name: string) => void
}

export const MultisigOwnerNameModal: FC<MultisigOwnerNameProps> = ({
  isOpen,
  onUpdate,
  onClose,
}) => {
  const [name, setName] = useState("")

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background="neutrals.700">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Add owner name
          </H5>
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button
            w="100%"
            colorScheme="primary"
            isDisabled={!name}
            onClick={() => {
              onUpdate(name)
              onClose()
              setName("")
            }}
          >
            Save
          </Button>
          <Button w="100%" colorScheme="neutrals" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
