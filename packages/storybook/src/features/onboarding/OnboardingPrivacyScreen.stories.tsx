import { OnboardingPrivacyStatementScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingPrivacyStatementScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingPrivacyStatementScreen",
  component: OnboardingPrivacyStatementScreen,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingPrivacyStatementScreen>

const Template: ComponentStory<typeof OnboardingPrivacyStatementScreen> = (
  props,
) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingPrivacyStatementScreen
      {...props}
    ></OnboardingPrivacyStatementScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
