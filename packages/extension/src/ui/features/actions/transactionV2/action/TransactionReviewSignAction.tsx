import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  useDisclosure,
} from "@chakra-ui/react"
import { FC } from "react"

import {
  AccordionIconDropdown,
  L1,
  L2,
  ModalDialogData,
  NestedAccordion,
  P4,
  icons,
} from "@argent/x-ui"
import { typedData } from "starknet"
import { JsonObject } from "type-fest"

const { ChevronRightIcon } = icons

interface TransactionReviewSignActionProps {
  dataToSign: typedData.TypedData
}

export const TransactionReviewSignAction: FC<
  TransactionReviewSignActionProps
> = ({ dataToSign }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { domain, message } = dataToSign
  let data = "Error: unable to parse message"
  try {
    if (message !== undefined) {
      data = JSON.stringify(message, null, 2)
    }
  } catch {
    // ignore stringify error
  }
  return (
    <>
      <ModalDialogData
        title="Raw message data"
        data={data}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Flex alignItems={"center"} w="full" color={"text-secondary"} px={3}>
        <L1>Data to be signed</L1>
        <Flex
          onClick={onOpen}
          alignItems={"center"}
          gap={0.5}
          ml={"auto"}
          transitionProperty="common"
          transitionDuration="fast"
          _hover={{
            color: "text-primary",
            cursor: "pointer",
          }}
        >
          <L2 as="span">View raw</L2>
          <ChevronRightIcon fontSize={"0.625rem"} />
        </Flex>
      </Flex>
      <JsonAccordion
        title={"Message"}
        json={message as JsonObject}
        initiallyExpanded
      />
      <JsonAccordion
        title={"Domain"}
        json={domain as JsonObject}
        initiallyExpanded
      />
    </>
  )
}

function JsonAccordion({
  title,
  json,
  initiallyExpanded,
}: {
  title: string
  json: JsonObject
  initiallyExpanded?: boolean
}) {
  const defaultIndex = initiallyExpanded ? 0 : undefined
  return (
    <Accordion
      colorScheme="neutrals"
      size="sm"
      allowToggle
      defaultIndex={defaultIndex}
    >
      <AccordionItem>
        <AccordionButton>
          <P4 fontWeight="semibold" mr={1}>
            {title}
          </P4>
          <AccordionIconDropdown />
        </AccordionButton>
        <AccordionPanel>
          <NestedAccordion json={json} initiallyExpanded={initiallyExpanded} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
