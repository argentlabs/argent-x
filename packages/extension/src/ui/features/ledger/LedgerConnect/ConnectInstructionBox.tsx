import { P2, P3 } from "@argent/x-ui"
import type { FlexProps } from "@chakra-ui/react"
import { Box, Circle, Divider, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { TrackingLink } from "../../../components/TrackingLink"

export const ConnectInstructionBox: FC = () => {
  return (
    <Flex
      px={0.5}
      flexDirection="column"
      alignItems="flex-start"
      alignSelf="stretch"
      borderRadius="12px"
      border="1px solid"
      borderColor="neutrals.600"
    >
      <StepBox step={1}>
        <P2>Plug in and unlock your ledger</P2>
      </StepBox>
      <Divider />
      <StepBox step={2}>
        <Flex
          flexDirection="column"
          justify="center"
          alignItems="flex-start"
          gap={2}
          flex="1 0 0"
        >
          <P2>Open the Starknet app on your Ledger</P2>
          <P3 color="neutrals.300">
            You will need to first install the Starknet app from
            <Box as="span" color="primary.500" cursor={"pointer"}>
              <TrackingLink
                href={`https://support.ledger.com/hc/en-us/articles/16765262529821-Starknet-STRK?docs=true`}
                targetBlank
              >
                {" "}
                Ledger Live{" "}
              </TrackingLink>
            </Box>
            if you haven’t already
          </P3>
        </Flex>
      </StepBox>
    </Flex>
  )
}

interface StepBoxProps extends FlexProps {
  step: number
  children: React.ReactNode
}

const StepBox: FC<StepBoxProps> = ({ step, children }) => {
  return (
    <Flex p={3} alignItems="center" gap={3} alignSelf="stretch">
      <Circle
        size={6}
        bg="neutrals.700"
        color="white"
        p={1.5}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {step}
      </Circle>
      {children}
    </Flex>
  )
}
