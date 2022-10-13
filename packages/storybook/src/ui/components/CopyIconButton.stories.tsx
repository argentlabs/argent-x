import { CopyIconButton } from "@argent-x/extension/src/ui/components/CopyIconButton"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/CopyIconButton",
  component: CopyIconButton,
} as ComponentMeta<typeof CopyIconButton>

const Template: ComponentStory<typeof CopyIconButton> = (props) => (
  <CopyIconButton {...props}></CopyIconButton>
)

export const IconAndText = Template.bind({})
IconAndText.args = {
  copyValue: "Will be copied to clipboard",
  children: <>Some content in here</>,
}

export const IconOnly = Template.bind({})
IconOnly.args = {
  copyValue: "Will be copied to clipboard",
}
