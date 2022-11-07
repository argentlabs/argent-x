import { H5, Input, L2, icons } from "@argent/ui"
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
      <Input
        placeholder="[TBD] replace by pin input"
        autoFocus
        onChange={(e) => console.log(e.target.value)}
      />
      <L2 as="a" href="#" mt={6} color={"accent.500"}>
        Not received an email?
      </L2>
    </Layout>
  )
}
