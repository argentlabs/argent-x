import { EscapeGuardianReady } from "@argent-x/extension/src/ui/features/shield/escape/EscapeGuardianReady"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/EscapeGuardianReady",
  component: EscapeGuardianReady,
} as ComponentMeta<typeof EscapeGuardianReady>

const Template: ComponentStory<typeof EscapeGuardianReady> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <EscapeGuardianReady {...props} />
  </MemoryRouter>
)

export const Step1 = Template.bind({})
Step1.args = {
  accountGuardianIsSelf: false,
}

export const Step2 = Template.bind({})
Step2.args = {
  accountGuardianIsSelf: true,
}
