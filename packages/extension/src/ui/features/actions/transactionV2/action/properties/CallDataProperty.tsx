import { Text, useDisclosure } from "@chakra-ui/react"

import type { Property } from "../../../../../../shared/transactionReview/schema"
import { ModalDialogData } from "@argent/x-ui"

export function CallDataProperty(
  property: Extract<Property, { type: "calldata" }>,
) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const calldata = JSON.stringify(property.calldata, null, 2)
  return (
    <>
      <ModalDialogData
        title="Transaction call data"
        data={calldata}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Text
        ml="auto"
        textAlign="right"
        onClick={onOpen}
        cursor="pointer"
        _hover={{
          textDecoration: "underline",
          color: "text-secondary",
        }}
      >
        {property.entrypoint}
      </Text>
    </>
  )
}
