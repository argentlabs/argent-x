import { OnboardingRestoreSeed } from "@argent-x/extension/src/ui/features/onboarding/OnboardingRestoreSeed"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingRestoreSeed",
  component: OnboardingRestoreSeed,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingRestoreSeed>

const Template: ComponentStory<typeof OnboardingRestoreSeed> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingRestoreSeed {...props}></OnboardingRestoreSeed>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
