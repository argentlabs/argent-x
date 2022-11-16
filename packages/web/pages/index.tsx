import { Box, Spinner } from "@chakra-ui/react"

import { Layout } from "../components/Layout"

export default function Home() {
  return (
    <Layout>
      <Box
        pos="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    </Layout>
  )
}
