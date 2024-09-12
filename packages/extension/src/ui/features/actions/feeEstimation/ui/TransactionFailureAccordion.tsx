import { AccordionIcon, P4, iconsDeprecated } from "@argent/x-ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
} from "@chakra-ui/react"
import { FC } from "react"

import { FeeEstimationProps } from "../feeEstimation.model"
import { CopyErrorIcon } from "./CopyErrorIcon"

const { AlertIcon } = iconsDeprecated

export const TransactionFailureAccordion: FC<
  Pick<FeeEstimationProps, "parsedFeeEstimationError">
> = ({ parsedFeeEstimationError }) => {
  if (!parsedFeeEstimationError) {
    return null
  }
  const { title, message } = parsedFeeEstimationError
  return (
    <Accordion
      allowToggle
      size="sm"
      colorScheme="error"
      rounded={"lg"}
      _dark={{
        boxShadow: "menu",
      }}
    >
      <AccordionItem>
        <AccordionButton>
          <Flex flex="auto" textAlign="left" alignItems={"center"}>
            <AlertIcon display={"inline-block"} fontSize={"base"} mr={1} />
            {title || "Transaction failure predicted"}
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
          <P4 color="text-danger" whiteSpace="pre-wrap">
            {message}
          </P4>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
