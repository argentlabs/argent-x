import { OnboardingFinishScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingFinishScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingFinishScreen",
  component: OnboardingFinishScreen,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingFinishScreen>

const Template: ComponentStory<typeof OnboardingFinishScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingFinishScreen {...props}></OnboardingFinishScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
