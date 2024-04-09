import { H5 } from "@argent/x-ui"
import {
  Button,
  Flex,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"
import { PasswordForm } from "../features/lock/PasswordForm"

interface ClearStorageModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string) => Promise<boolean>
  isClearingStorage: boolean
}

export const ClearStorageModal: FC<ClearStorageModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isClearingStorage,
}) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
        <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
        <ModalContent background="neutrals.700" borderRadius="2xl">
          <ModalHeader mt={2}>
            <H5 fontWeight="600" textAlign="center">
              Enter your password to clear storage
            </H5>
          </ModalHeader>

          <ModalFooter flexDirection="column" gap="1">
            <PasswordForm
              flex={1}
              verifyPassword={onConfirm}
              justifyContent="space-between"
              w={"100%"}
              mt={-2}
            >
              {(isDirty) => (
                <Flex flexDir="column">
                  <Button
                    gap="2"
                    colorScheme="primary"
                    type="submit"
                    loadingText="Clear"
                    disabled={!isDirty || isClearingStorage}
                    mt={6}
                    width="100%"
                    isLoading={isClearingStorage}
                  >
                    Clear
                  </Button>
                  <Button onClick={onClose} mt={2} disabled={isClearingStorage}>
                    Cancel
                  </Button>
                </Flex>
              )}
            </PasswordForm>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
