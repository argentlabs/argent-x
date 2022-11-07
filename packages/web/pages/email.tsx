import { Button, H5, Input } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import Image from "next/image"

import { Layout } from "../components/Layout"

export default function Email() {
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
        <Image src="/dapp-logo.svg" alt="Argent Logo" width={72} height={72} />
        <H5 textAlign="center">
          Enter your email to connect to Some Cool Dapp
        </H5>
      </Box>
      <Input
        placeholder="Enter email"
        autoFocus
        onChange={(e) => console.log(e.target.value)}
      />
      <Button
        colorScheme={"primary"}
        mt={8}
        onClick={() => console.log("clicked")}
      >
        Continue
      </Button>
    </Layout>
  )
}
