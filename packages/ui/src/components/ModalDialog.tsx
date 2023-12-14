import {
  Flex,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalProps,
  useModalContext,
} from "@chakra-ui/react"
import { FC } from "react"

import { pxToRem } from "../theme/utilities/pxToRem"
import { Button } from "./Button"
import { H6 } from "./Typography"
import { CloseIcon } from "./icons"

export const ModalCloseButton: FC = () => {
  const { onClose } = useModalContext()
  return (
    <Button
      ml="auto"
      colorScheme="transparent"
      size="auto"
      color="black50"
      fontSize="xl"
      onClick={onClose}
      _dark={{
        color: "white50",
      }}
    >
      <CloseIcon />
    </Button>
  )
}

export interface ModalDialogProps extends ModalProps {
  title?: string
}

/**
 * Wraps Chakra Modal {@link https://chakra-ui.com/docs/components/modal}
 * with a simpler API
 */

export const ModalDialog: FC<ModalDialogProps> = ({
  title,
  children,
  ...rest
}) => {
  return (
    <Modal isCentered {...rest}>
      <ModalOverlay bg="black50">
        <ModalContent
          p={4}
          gap={4}
          bg="surface.default"
          rounded="2xl"
          maxWidth={[pxToRem(320), pxToRem(480)]}
          alignItems={"center"}
        >
          <Flex alignItems={"center"} w="full">
            {title && <H6>{title}</H6>}
            <ModalCloseButton />
          </Flex>
          {children}
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}
