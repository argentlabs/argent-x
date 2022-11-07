import { Empty, EmptyButton, icons } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"

const { AddIcon } = icons

export default {
  title: "components/Empty",
  component: Empty,
} as ComponentMeta<typeof Empty>

const Template: ComponentStory<typeof Empty> = (props) => (
  <div style={{ width: "328px", height: "568px", display: "flex" }}>
    <Empty {...props}></Empty>
  </div>
)

export const Default = Template.bind({})
Default.args = {}

export const WithButton = Template.bind({})
WithButton.args = {
  children: <EmptyButton leftIcon={<AddIcon />}>Create account</EmptyButton>,
}
