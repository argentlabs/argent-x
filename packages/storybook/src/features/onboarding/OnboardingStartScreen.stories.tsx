import { OnboardingStartScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingStartScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingStartScreen",
  component: OnboardingStartScreen,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingStartScreen>

const Template: ComponentStory<typeof OnboardingStartScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingStartScreen {...props}></OnboardingStartScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
