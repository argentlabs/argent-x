import { P4, icons } from "@argent/ui"
import { Flex, useDisclosure } from "@chakra-ui/react"
import { Call } from "starknet"
import { CallDataModal } from "./action/properties/TransactionReviewProperty"

const { AlertFillIcon } = icons
export const ReviewFallback = ({ calls }: { calls: Call[] }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const calldata = JSON.stringify(calls, null, 2)
  return (
    <Flex direction={"column"} alignItems="center">
      <Flex
        p={3}
        backgroundColor="errorExtraDark"
        borderRadius={12}
        gap={2}
        marginBottom={4}
      >
        <AlertFillIcon width={5} height={5} color="errorText" />
        <P4 fontWeight="bold" color="errorText">
          Failed to load transaction details and fraud warnings. Continue at
          your own risk, or contact support
        </P4>
      </Flex>
      <CallDataModal
        calldata={calldata}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        label="View call data"
        title="Transaction call data"
        alignRight={false}
      />
    </Flex>
  )
}
