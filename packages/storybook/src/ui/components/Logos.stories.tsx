import { P3, logos } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { FC } from "react"

const Logos: FC = () => (
  <SimpleGrid columns={[2, 4, 6, 8]} spacing={10}>
    {Object.entries(logos).map(([name, Logo], index) => (
      <Flex flexDirection="column" alignItems="center" gap={3} key={index}>
        <Logo fontSize={"5xl"} backgroundColor={"neutrals.500"} />
        <P3>{name}</P3>
      </Flex>
    ))}
  </SimpleGrid>
)

export default {
  title: "components/Logos",
  component: Logos,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof Logos>

const Template: ComponentStory<typeof Logos> = (props) => (
  <Logos {...props}></Logos>
)

export const Default = Template.bind({})
Default.args = {}
