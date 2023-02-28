import {
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
} from "@argent-x/extension/src/shared/shield/validation"
import { ShieldValidationErrorScreen } from "@argent-x/extension/src/ui/features/shield/ShieldValidationErrorScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/ShieldValidationErrorScreen",
  component: ShieldValidationErrorScreen,
} as ComponentMeta<typeof ShieldValidationErrorScreen>

const Template: ComponentStory<typeof ShieldValidationErrorScreen> = (
  props,
) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShieldValidationErrorScreen {...props} />
  </MemoryRouter>
)

const onDone = () => console.log("onDone")

export const Scenario1 = Template.bind({})
Scenario1.args = {
  error: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  onDone,
}

export const Scenario2 = Template.bind({})
Scenario2.args = {
  error: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  onDone,
}

export const Scenario3 = Template.bind({})
Scenario3.args = {
  error: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
  onDone,
}
