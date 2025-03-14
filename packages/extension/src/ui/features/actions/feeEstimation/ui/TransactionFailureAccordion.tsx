import { WarningCircleSecondaryIcon } from "@argent/x-ui/icons"
import { AccordionIcon, P3 } from "@argent/x-ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
} from "@chakra-ui/react"
import type { FC } from "react"

import type { FeeEstimationProps } from "../feeEstimation.model"
import { CopyErrorIcon } from "./CopyErrorIcon"

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
            <WarningCircleSecondaryIcon
              display={"inline-block"}
              fontSize={"base"}
              mr={1}
            />
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
          <P3 color="text-danger" whiteSpace="pre-wrap">
            {message}
          </P3>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
