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

interface MultisigHideModalProps {
  isOpen: boolean
  onHide?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>
  onClose: () => void
  multisigType: "pending" | "active"
}

export const MultisigHideModal: FC<MultisigHideModalProps> = ({
  isOpen,
  onHide,
  onClose,
  multisigType,
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
            {multisigType === "pending" && (
              <>
                The multisig owner can still add you to the multisig if you
                shared your signer pubkey with them
              </>
            )}
            {multisigType === "active" && (
              <>
                You can still be added to the multisig in the future. You can
                always unhide this account from the account list screen.
              </>
            )}
          </P2>
        </ModalBody>

        <ModalFooter flexDirection="column" gap="3">
          <Button
            w="100%"
            colorScheme="primary"
            onClick={(e) => {
              if (onHide) {
                void onHide(e)
              }
            }}
          >
            Hide
          </Button>
          <Button w="100%" backgroundColor="neutrals.600" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
