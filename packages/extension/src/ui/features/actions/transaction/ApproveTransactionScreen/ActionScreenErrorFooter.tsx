import { icons } from "@argent/x-ui"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionProps,
  Flex,
} from "@chakra-ui/react"
import { FC, ReactNode } from "react"
import { CopyErrorIcon } from "../../feeEstimation/ui/CopyErrorIcon"

const { AlertIcon } = icons

interface ActionScreenErrorFooterProps extends Omit<AccordionProps, "title"> {
  errorMessage?: string
  title: ReactNode
}

export const ActionScreenErrorFooter: FC<ActionScreenErrorFooterProps> = ({
  errorMessage = "Unknown error",
  title,
  ...rest
}) => {
  const parsedFeeEstimationError = { title, message: errorMessage }
  return (
    <Accordion
      size="sm"
      colorScheme="error"
      boxShadow={"menu"}
      rounded={"lg"}
      _dark={{
        boxShadow: "menu",
      }}
      allowToggle
      {...rest}
    >
      <AccordionItem>
        <AccordionButton>
          <Flex flex="auto" textAlign="left" alignItems={"center"}>
            <AlertIcon display={"inline-block"} fontSize={"base"} mr={2} />
            {title}
          </Flex>
          <Flex ml={1} gap={3}>
            <CopyErrorIcon copyValue={parsedFeeEstimationError.message} />
            <AccordionIcon />
          </Flex>
        </AccordionButton>
        <AccordionPanel
          sx={{
            maxHeight: "60vh",
            overflow: "auto",
          }}
        >
          {errorMessage}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
