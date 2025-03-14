import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingStartScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingStartScreen"

const meta: Meta<typeof OnboardingStartScreen> = {
  component: OnboardingStartScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingStartScreen>

export const Default: Story = {
  args: {},
}
