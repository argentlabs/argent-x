import { generateAvatarImage } from "@argent/x-shared"
import { Box, Img, SimpleGrid } from "@chakra-ui/react"
import { PropsWithChildren } from "react"

export default {
  component: Box,
  render: (props: PropsWithChildren) => <Box {...props} />,
}

export const Examples = {
  args: {
    children: (
      <SimpleGrid columns={4} spacing={2}>
        <Img
          src={generateAvatarImage("Account", { background: "#666666" })}
          rounded={"full"}
        />
        <Img
          src={generateAvatarImage("Account 1", { background: "#666666" })}
          rounded={"full"}
        />
        <Img
          src={generateAvatarImage("Account 10", { background: "#666666" })}
          rounded={"full"}
        />
        <Img
          src={generateAvatarImage("Account 100", { background: "#666666" })}
          rounded={"full"}
        />
      </SimpleGrid>
    ),
  },
}
