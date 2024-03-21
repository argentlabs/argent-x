import { P4, icons } from "@argent/x-ui"
import { Flex, FlexProps, useDisclosure } from "@chakra-ui/react"
import { Call } from "starknet"
import { CallDataModal } from "./action/properties/ui/CallDataModal"
import { FC } from "react"

const { AlertFillIcon } = icons

interface ReviewFallbackProps extends FlexProps {
  calls: Call[]
  message?: string
}

export const ReviewFallback: FC<ReviewFallbackProps> = ({
  calls,
  message = "Failed to load transaction details and fraud warnings. Continue at your own risk, or contact support",
  ...rest
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const calldata = JSON.stringify(calls, null, 2)
  return (
    <Flex direction={"column"} alignItems="center" {...rest}>
      <Flex
        p={3}
        backgroundColor="surface-danger-default"
        borderRadius={12}
        gap={2}
        marginBottom={4}
      >
        <AlertFillIcon color="text-danger" fontSize="base" flexShrink={0} />
        <P4 fontWeight="bold" color="text-danger">
          {message}
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
