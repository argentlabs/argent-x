import { ShieldAccountActivate } from "@argent-x/extension/src/ui/features/shield/ShieldAccountActivate"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/ShieldAccountActivate",
  component: ShieldAccountActivate,
} as ComponentMeta<typeof ShieldAccountActivate>

const Template: ComponentStory<typeof ShieldAccountActivate> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShieldAccountActivate {...props} />
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
