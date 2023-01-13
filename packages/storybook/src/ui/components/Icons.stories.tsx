import { P3, icons } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { FC } from "react"

const Icons: FC = () => (
  <SimpleGrid columns={[2, 4, 6, 8]} spacing={10}>
    {Object.entries(icons).map(([name, Icon], index) => (
      <Flex flexDirection="column" alignItems="center" gap={3} key={index}>
        <Icon color={"gray.100"} fontSize={"5xl"} backgroundColor={"white30"} />
        <P3>{name}</P3>
      </Flex>
    ))}
  </SimpleGrid>
)

export default {
  title: "components/Icons",
  component: Icons,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof Icons>

const Template: ComponentStory<typeof Icons> = (props) => (
  <Icons {...props}></Icons>
)

export const Default = Template.bind({})
Default.args = {}
