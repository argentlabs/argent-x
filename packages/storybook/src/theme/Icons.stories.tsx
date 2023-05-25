import { P3, icons } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC } from "react"

const Icons: FC = () => (
  <SimpleGrid columns={[2, 4, 6, 8]} spacing={10}>
    {Object.entries(icons).map(([name, Icon]) => (
      <Flex flexDirection="column" alignItems="center" gap={3} key={name}>
        <Icon color={"gray.100"} fontSize={"5xl"} backgroundColor={"white30"} />
        <P3>{name}</P3>
      </Flex>
    ))}
  </SimpleGrid>
)

export default {
  component: Icons,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
}

export const Default = {
  args: {},
}
