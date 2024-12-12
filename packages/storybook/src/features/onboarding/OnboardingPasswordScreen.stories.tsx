import { Meta, StoryObj } from "@storybook/react"
import { OnboardingPasswordScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingPasswordScreen"

const meta: Meta<typeof OnboardingPasswordScreen> = {
  component: OnboardingPasswordScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingPasswordScreen>

export const Default: Story = {
  args: {},
}
