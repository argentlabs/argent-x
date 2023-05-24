import { P3, logos } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC } from "react"

const Logos: FC = () => (
  <SimpleGrid columns={[2, 4, 6, 8]} spacing={10}>
    {Object.entries(logos).map(([name, Logo]) => (
      <Flex flexDirection="column" alignItems="center" gap={3} key={name}>
        <Logo fontSize={"5xl"} backgroundColor={"neutrals.500"} />
        <P3>{name}</P3>
      </Flex>
    ))}
  </SimpleGrid>
)

export default {
  component: Logos,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
}

export const Default = {
  args: {},
}
