import { Button, H5, P3, icons } from "@argent/ui"
import {
  Center,
  Circle,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { upperFirst } from "lodash-es"
import { FC } from "react"

import { VerifiedDappBannerProps } from "."

const { VerifiedIcon, CloseIcon } = icons

const VERIFIED_DAPPS_LINK =
  "https://support.argent.xyz/hc/en-us/articles/9950642428829"

interface VerifiedDappModalProps extends VerifiedDappBannerProps {
  isOpen: boolean
  onClose: () => void
}

/** TODO: this should be able to be implemented with <AlertDialog /> component */

const VerifiedDappModal: FC<VerifiedDappModalProps> = ({
  dapp,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent
        background="neutrals.700"
        borderRadius="2xl"
        position="relative"
        p={5}
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
            <H5 mt={3} textAlign="center">
              Verified Dapp
            </H5>
            <P3 mt={2} textAlign="center">
              This is a verified {upperFirst(dapp.name.toLowerCase())}{" "}
              transaction
            </P3>
          </Center>
        </ModalHeader>
        <ModalFooter p={0}>
          <Button
            as={"a"}
            mt={4}
            w={"full"}
            size={"sm"}
            bg="neutrals.600"
            _hover={{ bg: "neutrals.500" }}
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
