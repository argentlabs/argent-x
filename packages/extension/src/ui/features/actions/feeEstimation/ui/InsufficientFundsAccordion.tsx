import { WarningCircleSecondaryIcon } from "@argent/x-ui/icons"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
} from "@chakra-ui/react"
import type { FC } from "react"

import type { FeeEstimationTextProps } from "./FeeEstimationText"
import { FeeEstimationText } from "./FeeEstimationText"

export const InsufficientFundsAccordion: FC<FeeEstimationTextProps> = (
  props,
) => {
  return (
    <Accordion
      defaultIndex={[0]}
      size="sm"
      colorScheme="error"
      rounded={"lg"}
      _dark={{
        boxShadow: "menu",
      }}
    >
      <AccordionItem>
        <AccordionButton sx={{ pointerEvents: "none" }}>
          <Flex mr="auto" textAlign="left" alignItems={"center"}>
            <WarningCircleSecondaryIcon
              display={"inline-block"}
              fontSize={"base"}
              mr={1}
            />
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
