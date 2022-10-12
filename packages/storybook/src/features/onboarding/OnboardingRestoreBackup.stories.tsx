import { OnboardingRestoreBackup } from "@argent-x/extension/src/ui/features/onboarding/OnboardingRestoreBackup"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "onboarding/OnboardingRestoreBackup",
  component: OnboardingRestoreBackup,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof OnboardingRestoreBackup>

const Template: ComponentStory<typeof OnboardingRestoreBackup> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <OnboardingRestoreBackup {...props}></OnboardingRestoreBackup>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
