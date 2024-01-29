import { H6, icons } from "@argent/ui"
import { Box, Flex, HStack, Text } from "@chakra-ui/react"
import { FC } from "react"

const { AlertFillIcon } = icons

export const WarningRecoverySeedphraseBanner: FC = () => {
  return (
    <Flex
      p={4}
      mb={2}
      direction={"column"}
      backgroundColor="error.900"
      justifyContent={"center"}
      alignContent={"center"}
      borderRadius="xl"
    >
      <H6 color="errorText" mb={2} ml={1}>
        Never share your recovery phrase!
      </H6>
      <HStack mb={1}>
        <Box>
          <AlertFillIcon color="errorText" fontSize="lg" />
        </Box>

        <Text>It&apos;s the only way to recover your wallet</Text>
      </HStack>
      <HStack>
        <Box>
          <AlertFillIcon color="errorText" fontSize="lg" />
        </Box>

        <Text>
          If someone else has access to your recovery phrase they can control
          your wallet
        </Text>
      </HStack>
    </Flex>
  )
}
