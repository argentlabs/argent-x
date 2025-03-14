import { WarningCirclePrimaryIcon } from "@argent/x-ui/icons"
import { CallDataModal, P3 } from "@argent/x-ui"
import type { FlexProps } from "@chakra-ui/react"
import { Flex, useDisclosure } from "@chakra-ui/react"
import type { Call } from "starknet"
import type { FC } from "react"

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
        <WarningCirclePrimaryIcon
          color="text-danger"
          fontSize="base"
          flexShrink={0}
        />
        <P3 fontWeight="bold" color="text-danger">
          {message}
        </P3>
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
