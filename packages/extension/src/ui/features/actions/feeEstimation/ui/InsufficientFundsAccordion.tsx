import { icons } from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
} from "@chakra-ui/react"
import { FC } from "react"

import { FeeEstimationText, FeeEstimationTextProps } from "./FeeEstimationText"

const { AlertIcon } = icons

export const InsufficientFundsAccordion: FC<FeeEstimationTextProps> = (
  props,
) => {
  return (
    <Accordion
      defaultIndex={[0]}
      size="sm"
      colorScheme="error"
      boxShadow={"menu"}
    >
      <AccordionItem>
        <AccordionButton sx={{ pointerEvents: "none" }}>
          <Flex mr="auto" textAlign="left" alignItems={"center"}>
            <AlertIcon display={"inline-block"} fontSize={"base"} mr={1} />
            Insufficient funds to pay network fee
          </Flex>
        </AccordionButton>
        <AccordionPanel>
          <FeeEstimationText colorScheme="error" {...props} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
