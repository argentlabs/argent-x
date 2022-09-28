import { OnboardingPrivacyScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingPrivacyScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingPrivacyScreen",
  component: OnboardingPrivacyScreen,
} as ComponentMeta<typeof OnboardingPrivacyScreen>

const Template: ComponentStory<typeof OnboardingPrivacyScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingPrivacyScreen {...props}></OnboardingPrivacyScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
