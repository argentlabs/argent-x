import { Button, H5, P3, icons } from "../../"
import {
  Center,
  Circle,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"

const { VerifiedIcon, CloseIcon } = icons

interface KnownDappModalProps {
  isOpen: boolean
  onClose: () => void
  dapplandUrl?: string
}

export const KnownDappModal: FC<KnownDappModalProps> = ({
  isOpen,
  onClose,
  dapplandUrl = "https://www.dappland.com/",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent
        background="neutrals.700"
        borderRadius="2xl"
        position="relative"
        p={5}
        maxW="17.5rem"
      >
        <ModalHeader p={0}>
          <Button
            position={"absolute"}
            right={3}
            top={3}
            size={"auto"}
            borderRadius="full"
            p={1.5}
            onClick={onClose}
            autoFocus={false}
            _focus={{ boxShadow: "none" }}
          >
            <CloseIcon fontSize={"2xs"} />
          </Button>
          <Center flexDirection={"column"}>
            <Circle
              mt={1}
              size={18}
              border="2px solid"
              color={"success.500"}
              borderColor={"success.500"}
            >
              <VerifiedIcon fontSize={"5xl"} />
            </Circle>
            <H5 mt={4} textAlign="center">
              Known Dapp
            </H5>
            <P3 mt={2} textAlign="center">
              This dapp is listed on Dappland
            </P3>
          </Center>
        </ModalHeader>
        <ModalFooter p={0}>
          <Button
            as={"a"}
            mt={6}
            w={"full"}
            size={"sm"}
            bg="neutrals.600"
            _hover={{ bg: "neutrals.500" }}
            href={dapplandUrl}
            target="_blank"
          >
            Review on Dappland
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
