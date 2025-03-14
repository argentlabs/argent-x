import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingFinishScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingFinishScreen"

const meta: Meta<typeof OnboardingFinishScreen> = {
  component: OnboardingFinishScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingFinishScreen>

export const Default: Story = {
  args: {},
}

export const Smart: Story = {
  args: { isSmart: true },
}
