import { Box, Center, Image, SystemStyleObject } from "@chakra-ui/react"

import { AggregatedSimData } from "@argent/x-shared"
import { isEmpty } from "lodash-es"
import { useMemo } from "react"
import { Network } from "../../../../../../../shared/network"
import { useToken } from "../../../../../accountTokens/tokens.state"
import { UnknownTokenIcon } from "./UnknownTokenIcon"

export const SwapTransactionIcon = ({
  aggregatedData,
  network,
}: {
  aggregatedData?: AggregatedSimData[]
  network: Network
}) => {
  const srcAddress = useMemo(
    () => aggregatedData?.find((ag) => ag.recipients.length > 0)?.token.address,
    [aggregatedData],
  )

  const dstAddress = useMemo(
    () => aggregatedData?.find((ag) => isEmpty(ag.recipients))?.token.address,
    [aggregatedData],
  )

  const srcToken = useToken({
    address: srcAddress || "0x0",
    networkId: network.id,
  })

  const dstToken = useToken({
    address: dstAddress || "0x0",
    networkId: network.id,
  })
  const token1Styling: SystemStyleObject = {
    height: "9",
    width: "9",
    position: "absolute",
    zIndex: "1",
    top: "0",
    left: "0",
  }

  const token2Styling: SystemStyleObject = {
    height: "10",
    width: "10",
    position: "absolute",
    zIndex: "2",
    bottom: "0",
    right: "0",
  }

  return (
    <Center data-testid="swap-transaction-icon">
      <Box height="14" width="14" position="relative">
        {srcToken?.iconUrl ? (
          <Image src={srcToken.iconUrl} sx={token1Styling} />
        ) : (
          <UnknownTokenIcon sx={token1Styling} />
        )}
        {dstToken?.iconUrl ? (
          <Image src={dstToken.iconUrl} sx={token2Styling} />
        ) : (
          <UnknownTokenIcon sx={token2Styling} />
        )}
      </Box>
    </Center>
  )
}
