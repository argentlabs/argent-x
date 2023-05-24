import {
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
} from "@chakra-ui/react"
import { FC } from "react"

import { Button } from "../Button"
import CloseIcon from "../icons/CloseIcon"
import VerifiedIcon from "../icons/VerifiedIcon"
import { H5, P3 } from "../Typography"

const VERIFIED_DAPPS_LINK =
  "https://support.argent.xyz/hc/en-us/articles/9950642428829"

interface VerifiedDappModalProps {
  isOpen: boolean
  onClose: () => void
}

const VerifiedDappModal: FC<VerifiedDappModalProps> = ({ isOpen, onClose }) => {
  const bg = useColorModeValue("white", "neutrals.700")
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent background={bg} borderRadius="2xl" position="relative">
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

        <ModalFooter p={0}>
          <Button
            as={"a"}
            mt={4}
            w={"full"}
            size={"sm"}
            colorScheme="info"
            variant={"outline"}
            href={VERIFIED_DAPPS_LINK}
            target="_blank"
          >
            Learn more
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export { VerifiedDappModal }
