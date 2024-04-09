import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
} from "@chakra-ui/react"
import { FC } from "react"
import { icons } from "@argent/x-ui"

const { AlertFillIcon } = icons
import { AccordionIconDropdown, P4 } from "@argent/x-ui"
import type {
  Action,
  Assessment,
} from "../../../../../shared/transactionReview/schema"
import { TransactionReviewProperties } from "./properties/TransactionReviewProperties"
import { TransactionReviewLabel } from "../TransactionReviewLabel"

interface TransactionReviewActionProps {
  action: Action
  initiallyExpanded?: boolean
  assessment: Assessment
}

export const TransactionReviewAction: FC<TransactionReviewActionProps> = ({
  action,
  initiallyExpanded,
  assessment,
}) => {
  const { name, properties, defaultProperties } = action
  const hasProperties = Boolean(properties.length)
  const hasDefaultProperties = defaultProperties && defaultProperties.length
  const defaultIndex = initiallyExpanded ? 0 : undefined
  return (
    <Accordion
      colorScheme="neutrals"
      size="sm"
      allowToggle
      defaultIndex={defaultIndex}
    >
      <AccordionItem>
        <AccordionButton
          justifyContent="space-between"
          data-testid={`transaction-review-action-${name}`}
        >
          <Flex alignItems={"center"}>
            <P4 fontWeight="semibold" mr={1}>
              <TransactionReviewLabel label={name} />
            </P4>
            <AccordionIconDropdown />
          </Flex>
          {assessment === "warn" && (
            <AlertFillIcon color="warning.500" fontSize={20} />
          )}
        </AccordionButton>

        {hasProperties && (
          <AccordionPanel>
            <TransactionReviewProperties properties={properties} />
          </AccordionPanel>
        )}
        {hasDefaultProperties && defaultProperties && (
          <AccordionPanel>
            <TransactionReviewProperties properties={defaultProperties} />
          </AccordionPanel>
        )}
      </AccordionItem>
    </Accordion>
  )
}
