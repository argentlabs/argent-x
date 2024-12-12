import { Box, Button, HStack, VStack } from "@chakra-ui/react"
import { base64, base64url } from "@scure/base"
import type { FC } from "react"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { FullscreenQrCode } from "../../../../components/QrCode"
import {
  B3,
  CopyTooltip,
  icons,
  L1Bold,
  P3,
  ScrollContainer,
} from "@argent/x-ui"
import { ScreenLayout } from "../../../ledger/layout/ScreenLayout"

const { CheckmarkSecondaryIcon } = icons

export const AirGapReviewScreen: FC = () => {
  const { data } = useParams<{ data: string }>()

  const [screenHeight, setScreenHeight] = useState(window.innerHeight)

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const parsedData = useMemo(
    () => (data ? base64.encode(base64url.decode(data)) : ""),
    [data],
  )

  if (!data) {
    return null
  }

  return (
    <ScrollContainer>
      <ScreenLayout length={0}>
        <AirGapReviewBody data={parsedData} screenHeight={screenHeight} />
      </ScreenLayout>
    </ScrollContainer>
  )
}

interface AirGapReviewBodyProps {
  data: string
  screenHeight: number
}

export const AirGapReviewBody: FC<AirGapReviewBodyProps> = ({
  data,
  screenHeight,
}) => {
  return (
    <VStack spacing="8" w="full">
      <FullscreenQrCode
        data={data}
        fullscreenSize={screenHeight * 0.9}
        size={388}
      />
      <VStack spacing="2">
        <Box
          bg="primary.blue.800"
          borderRadius="xl"
          p={3}
          w="full"
          textAlign="center"
          width={{ base: "full", md: "328px" }}
        >
          <L1Bold color="white">Scan the QR with an air-gapped device</L1Bold>
        </Box>

        <CopyTooltip copyValue={data} prompt="" placement="bottom">
          <Button
            variant="ghost"
            _hover={{ bg: "transparent" }}
            _active={{ boxShadow: "none" }}
          >
            <B3 color="text-subtle">or click here to copy transaction</B3>
          </Button>
        </CopyTooltip>
      </VStack>
      <Box
        borderTop="1px solid"
        borderColor="neutrals.700"
        w="full"
        pt={4.5}
        alignSelf={{ base: "flex-start", md: "center" }}
        width={{ base: "full", md: "328px" }}
      >
        <P3 color="neutrals.300" mb={3}>
          You will be able to:
        </P3>
        <Box
          w="full"
          borderRadius="xl"
          border="1px solid"
          borderColor="neutrals.600"
        >
          <VStack spacing="2" p={4} align="flex-start">
            <HStack spacing="3">
              <Box>
                <CheckmarkSecondaryIcon color="success.500" h={4} w={4} />
              </Box>
              <P3 color="neutrals.300">View the transaction details</P3>
            </HStack>
            <HStack spacing="3" align="flex-start">
              <Box>
                <CheckmarkSecondaryIcon color="success.500" h={4} w={4} />
              </Box>
              <P3 color="neutrals.300">
                Compare the transaction hash on your air-gapped device
              </P3>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}
