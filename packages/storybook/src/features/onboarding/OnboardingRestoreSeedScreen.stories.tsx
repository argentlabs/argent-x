import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingRestoreSeedScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingRestoreSeedScreen"

const meta: Meta<typeof OnboardingRestoreSeedScreen> = {
  component: OnboardingRestoreSeedScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingRestoreSeedScreen>

export const Default: Story = {
  args: {},
}
