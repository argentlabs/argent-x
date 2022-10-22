import { OnboardingRestorePassword } from "@argent-x/extension/src/ui/features/onboarding/OnboardingRestorePassword"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingRestorePassword",
  component: OnboardingRestorePassword,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingRestorePassword>

const Template: ComponentStory<typeof OnboardingRestorePassword> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingRestorePassword {...props}></OnboardingRestorePassword>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
