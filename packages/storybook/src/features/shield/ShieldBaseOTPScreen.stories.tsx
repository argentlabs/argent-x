import { ShieldBaseOTPScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseOTPScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/ShieldBaseOTPScreen",
  component: ShieldBaseOTPScreen,
} as ComponentMeta<typeof ShieldBaseOTPScreen>

const Template: ComponentStory<typeof ShieldBaseOTPScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShieldBaseOTPScreen {...props} />
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {
  email: "example@example.com",
}
