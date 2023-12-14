import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { Button } from "./Button"
import { ModalDialog, ModalDialogProps } from "./ModalDialog"
import { P4 } from "./Typography"
import { CopyIcon } from "./icons"
import { CopyTooltip } from "./CopyTooltip"
import { scrollbarStyle } from "../theme"

export interface ModalDialogDataProps
  extends Omit<ModalDialogProps, "children"> {
  data: string
}

export const ModalDialogData: FC<ModalDialogDataProps> = ({
  data,
  ...rest
}) => {
  return (
    <ModalDialog {...rest}>
      <Flex
        w="full"
        maxHeight={32}
        p={4}
        backgroundColor="surface.default"
        rounded="lg"
        border="1px solid"
        borderColor="neutrals.500"
      >
        <P4 w="full" overflow="auto" whiteSpace="pre" sx={scrollbarStyle}>
          {data}
        </P4>
      </Flex>
      <CopyTooltip copyValue={data}>
        <Button
          size="sm"
          bg="neutrals.200"
          _hover={{ bg: "neutrals.100" }}
          leftIcon={<CopyIcon />}
          _dark={{
            bg: "neutrals.600",
            _hover: {
              bg: "neutrals.500",
            },
          }}
        >
          Copy
        </Button>
      </CopyTooltip>
    </ModalDialog>
  )
}
