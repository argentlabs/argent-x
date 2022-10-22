import { OnboardingPasswordScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingPasswordScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingPasswordScreen",
  component: OnboardingPasswordScreen,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingPasswordScreen>

const Template: ComponentStory<typeof OnboardingPasswordScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingPasswordScreen {...props}></OnboardingPasswordScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
