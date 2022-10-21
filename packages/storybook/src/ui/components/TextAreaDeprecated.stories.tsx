import { TextArea } from "@argent-x/extension/src/ui/components/InputText"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/TextAreaDeprecated",
  component: TextArea,
} as ComponentMeta<typeof TextArea>

const Template: ComponentStory<typeof TextArea> = (props) => (
  <TextArea {...props}></TextArea>
)

export const Default = Template.bind({})
Default.args = {}

export const Variant = Template.bind({})
Variant.args = {
  variant: "neutrals800",
}
