import { ConfirmScreen } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { Center } from "@chakra-ui/layout"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/ConfirmScreen",
  component: ConfirmScreen,
} as ComponentMeta<typeof ConfirmScreen>

const Template: ComponentStory<typeof ConfirmScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ConfirmScreen {...props}>
      <Center rounded={"md"} bg={"neutrals.800"} height={800}>
        Some content in here
      </Center>
    </ConfirmScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {
  confirmButtonDisabled: false,
}

export const ConfirmWarnHigh = Template.bind({})
ConfirmWarnHigh.args = {
  confirmButtonVariant: "warn-high",
  confirmButtonDisabled: false,
}

export const ConfirmDanger = Template.bind({})
ConfirmDanger.args = {
  confirmButtonVariant: "danger",
  confirmButtonDisabled: false,
}
