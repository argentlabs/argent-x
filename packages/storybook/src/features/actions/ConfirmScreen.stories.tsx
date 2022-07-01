import { ConfirmScreen } from "@argent-x/extension/src/ui/features/actions/ConfirmScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/ConfirmScreen",
  component: ConfirmScreen,
} as ComponentMeta<typeof ConfirmScreen>

const Template: ComponentStory<typeof ConfirmScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ConfirmScreen {...props}></ConfirmScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {
  confirmButtonDisabled: false,
}

export const ConfirmWarn = Template.bind({})
ConfirmWarn.args = {
  confirmButtonVariant: "warn",
  confirmButtonDisabled: false,
}

export const ConfirmDanger = Template.bind({})
ConfirmDanger.args = {
  confirmButtonVariant: "danger",
  confirmButtonDisabled: false,
}
