import { B2, H3, ModalDialog, P2 } from "@argent/x-ui"
import { AlertSecondaryIcon } from "@argent/x-ui/icons"
import { Box, Button, Center } from "@chakra-ui/react"
import type { FC } from "react"

interface UnverifiedTokenWarningModalProps {
  onClose: () => void
  isOpen: boolean
}

export const UnverifiedTokenWarningDialog: FC<
  UnverifiedTokenWarningModalProps
> = ({ isOpen, onClose }) => {
  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <Center flexDirection="column" textAlign="center">
        <Box mb="4">
          <AlertSecondaryIcon h="52px" w="auto" color="icon-danger" />
        </Box>
        <H3 mb="2">Unknown token alert</H3>
        <Box pb="6" textAlign="center">
          <P2 color="text-primary">
            Anyone can create a token, including creating fake version of
            existing tokens that claim to represent projects. If you purchase
            this token, you may not be able to sell it back. <br /> <br /> Only
            interact with tokens you trust.
          </P2>
        </Box>

        <Button w="full" bg="button-secondary" onClick={onClose} size={"lg"}>
          <B2>Ok</B2>
        </Button>
      </Center>
    </ModalDialog>
  )
}
