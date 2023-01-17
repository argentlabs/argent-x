import { B3, Button, H5, P3, icons } from "@argent/ui"
import {
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"

const { VerifiedIcon, CloseIcon } = icons

interface VerifiedDappModalProps {
  isOpen: boolean
  onClose: () => void
}

const VerifiedDappModal: FC<VerifiedDappModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent
        background="neutrals.700"
        borderRadius="2xl"
        position="relative"
      >
        <ModalHeader paddingBottom="0">
          <Flex justify="flex-end">
            <Button
              borderRadius="full"
              p="6px"
              autoFocus={false}
              _focusVisible={{ boxShadow: "none" }}
              minH="0"
              minW="0"
              h="auto"
              lineHeight="auto"
              onClick={onClose}
            >
              <CloseIcon margin="0" height="8px" width="8px" />
            </Button>
          </Flex>

          <Flex flexDirection="column" gap="3" alignItems="center">
            <Center borderRadius="full" p="4.5" backgroundColor="secondaryDark">
              <VerifiedIcon width="35px" height="35px" color="white" />
            </Center>
            <H5 fontWeight="600" textAlign="center">
              Verified transaction
            </H5>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <P3 fontWeight="400" textAlign="center">
            This transaction has been marked as safe to interact with against a
            registry of verified smart contracts.
          </P3>
        </ModalBody>

        <ModalFooter>
          <Button
            w="100%"
            bgColor="neutrals.600"
            autoFocus={false}
            _hover={{ bgColor: "neutrals.500" }}
            onClick={onClose}
            _focusVisible={{ boxShadow: "none" }}
          >
            <B3>Learn more</B3>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export { VerifiedDappModal }
