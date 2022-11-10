import { Button, CopyTooltip } from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/CopyTooltip",
  component: CopyTooltip,
} as ComponentMeta<typeof CopyTooltip>

const Template: ComponentStory<typeof CopyTooltip> = (props) => (
  <Center>
    <CopyTooltip {...props}></CopyTooltip>
  </Center>
)

export const Default = Template.bind({})
Default.args = {
  message: "Copied",
  copyValue: "Will be copied to clipboard",
  children: <Button>Some content in here</Button>,
}
