import type { FC } from "react"
import { WarningCircleSecondaryIcon } from "@argent/x-ui/icons"
import { B2, B3, H3, ModalBottomDialog, P2 } from "@argent/x-ui"
import { Box, Button, Center, Divider, Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { pluralise } from "@argent/x-shared"
import type { AccountImportError } from "../../../shared/accountImport/types"

interface ImportErrorBottomModalProps {
  onClose: () => void
  isOpen: boolean
  errors: AccountImportError[]
}

export const ImportErrorBottomModal: FC<ImportErrorBottomModalProps> = ({
  isOpen,
  onClose,
  errors,
}) => {
  const header = `${pluralise(errors.length, "issue")} identified`

  if (isEmpty(errors)) {
    return null
  }

  return (
    <ModalBottomDialog isOpen={isOpen} onClose={onClose}>
      <Center flexDirection="column" textAlign="center">
        <Box mb="4">
          <WarningCircleSecondaryIcon
            h="40.5px"
            w="40.5px"
            color="primary.red.400"
          />
        </Box>
        <H3 mb="2">{header}</H3>
        <Box pb="6" textAlign="center">
          <P2 color="deprecated.neutrals.300">
            This account cannot be imported. <br />
            Please try another account.
          </P2>
        </Box>

        <Divider />

        <Box my="6" alignSelf="flex-start">
          {errors.map((error, i) => (
            <Flex key={i} align="center" textAlign="left" pl="1">
              <Box
                w={1}
                h={1}
                borderRadius="full"
                bg="white"
                mr={2}
                flexShrink={0}
              />
              <B3 color="white">{error}</B3>
            </Flex>
          ))}
        </Box>

        <Button w="full" bg="deprecated.neutrals.700" onClick={onClose}>
          <B2>Ok</B2>
        </Button>
      </Center>
    </ModalBottomDialog>
  )
}
