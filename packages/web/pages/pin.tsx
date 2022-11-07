import {
  H5,
  L2,
  PinInput,
  PinInputField,
  PinInputWrapper,
  icons,
} from "@argent/ui"
import { Box } from "@chakra-ui/react"

import { Layout } from "../components/Layout"

const { EmailIcon } = icons

export default function Pin() {
  return (
    <Layout maxW={330}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        mb={8}
      >
        <Box
          width={"72px"}
          height={"72px"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius={16}
          bgColor={"gray.100"}
        >
          <EmailIcon width={32} height={32} />
        </Box>
        <H5 textAlign="center">Enter the code we sent to itamar@argent.xyz</H5>
      </Box>
      <PinInputWrapper>
        <PinInput
          autoFocus
          type="number"
          otp
          onComplete={(x) => console.log("PIN:", x)}
        >
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
        </PinInput>
      </PinInputWrapper>
      <L2 as="a" href="#" mt={6} color={"accent.500"}>
        Not received an email?
      </L2>
    </Layout>
  )
}
