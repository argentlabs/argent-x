import { AccordionIcon, P4, icons } from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
} from "@chakra-ui/react"
import { FC } from "react"

import { FeeEstimationProps } from "../FeeEstimation"
import { CopyErrorIcon } from "./CopyErrorIcon"

const { AlertIcon } = icons

export const TransactionFailureAccordion: FC<
  Pick<FeeEstimationProps, "parsedFeeEstimationError">
> = ({ parsedFeeEstimationError }) => {
  return (
    <Accordion allowToggle size="sm" colorScheme="error" boxShadow={"menu"}>
      <AccordionItem>
        <AccordionButton>
          <Flex flex="auto" textAlign="left" alignItems={"center"}>
            <AlertIcon display={"inline-block"} fontSize={"base"} mr={1} />
            Transaction failure predicted
          </Flex>
          <Flex ml={1} gap={3}>
            <CopyErrorIcon
              parsedFeeEstimationError={parsedFeeEstimationError}
            />
            <AccordionIcon />
          </Flex>
        </AccordionButton>
        <AccordionPanel
          sx={{
            maxHeight: "60vh",
            overflow: "auto",
          }}
        >
          <P4 color="errorText" whiteSpace="pre-wrap">
            {parsedFeeEstimationError}
          </P4>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
