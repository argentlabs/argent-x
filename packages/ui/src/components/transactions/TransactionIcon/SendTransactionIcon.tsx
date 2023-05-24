import { TransactionReviewWithType, useToken } from "@argent/shared"
import { Box, Center, Image } from "@chakra-ui/react"

import { SendIcon } from "../../icons"
import { UnknownTokenIcon } from "./UnknownTokenIcon"

export const SendTransactionIcon = ({
  transaction,
  networkId,
}: {
  transaction: TransactionReviewWithType
  networkId: string
}) => {
  const srcToken = useToken({
    address: transaction?.activity?.value?.token.address || "0x0",
    networkId,
  })
  return (
    <Center data-testid="send-transaction-icon">
      <Box height="14" width="14" position="relative">
        <Center
          w="14"
          h="14"
          background="neutrals.600"
          borderRadius="90"
          boxShadow="menu"
          padding="4"
        >
          <SendIcon fontSize={"4xl"} color="white" />
          {srcToken ? (
            <Center
              w="28px"
              h="28px"
              background="neutrals.900"
              borderRadius="90"
              boxShadow="menu"
              padding="1"
              position="absolute"
              zIndex="1"
              right="-1"
              bottom="-1"
            >
              <Image src={srcToken?.image} height="5" width="5" zIndex="2" />
            </Center>
          ) : (
            <UnknownTokenIcon
              w="28px"
              h="28px"
              background="neutrals.900"
              borderRadius="90"
              boxShadow="menu"
              padding="1"
              position="absolute"
              zIndex="1"
              right="-1"
              bottom="-1"
            />
          )}
        </Center>
      </Box>
    </Center>
  )
}
