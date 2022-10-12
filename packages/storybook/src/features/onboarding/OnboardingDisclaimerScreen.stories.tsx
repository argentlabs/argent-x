import { OnboardingDisclaimerScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingDisclaimerScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingDisclaimerScreen",
  component: OnboardingDisclaimerScreen,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingDisclaimerScreen>

const Template: ComponentStory<typeof OnboardingDisclaimerScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingDisclaimerScreen {...props}></OnboardingDisclaimerScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
