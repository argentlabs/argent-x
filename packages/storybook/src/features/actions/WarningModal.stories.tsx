import type { ComponentProps } from "react"
import type { Warning } from "@argent/x-shared/simulation"

import { WarningModal } from "@argent-x/extension/src/ui/features/actions/warning/WarningModal"
import type { Meta, StoryObj } from "@storybook/react"

const meta: Meta<typeof WarningModal> = {
  component: WarningModal,
}

export default meta
type Story = StoryObj<typeof WarningModal>

const Default: Story = {
  render: (props: ComponentProps<typeof WarningModal>) => {
    return <WarningModal {...props} isOpen></WarningModal>
  },
}

const warningCritical: Warning = {
  reason: "recipient_is_black_listed",
  details: {
    date_of_addition: "2022-12-19T15:39:58.981614",
    contract_address:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    reason: "Technical address",
  },
  severity: "critical",
}

const warningHigh: Warning = {
  ...warningCritical,
  severity: "high",
}

const warningCaution: Warning = {
  ...warningCritical,
  severity: "caution",
}

const warningInfo: Warning = {
  ...warningCritical,
  severity: "info",
}

const warningsByReason = {
  recipient_is_black_listed: {
    description:
      "You are sending to a blacklisted contract that is considered unsafe.",
    reason: "recipient_is_black_listed",
    severity: "high",
    title: "Recipient on unsafe list",
  },
}

export const Critical: Story = {
  ...Default,
  args: {
    warnings: [warningCritical],
    highestSeverityWarning: warningCritical,
    warningsByReason,
  },
}

export const High: Story = {
  ...Default,
  args: {
    warnings: [warningHigh],
    highestSeverityWarning: warningHigh,
    warningsByReason,
  },
}

export const Caution: Story = {
  ...Default,
  args: {
    warnings: [warningCaution],
    highestSeverityWarning: warningCaution,
    warningsByReason,
  },
}

export const Info: Story = {
  ...Default,
  args: {
    warnings: [warningInfo],
    highestSeverityWarning: warningInfo,
    warningsByReason,
  },
}

export const Mixed: Story = {
  ...Default,
  args: {
    warnings: [warningCritical, warningHigh, warningCaution, warningInfo],
    highestSeverityWarning: warningCritical,
    warningsByReason,
  },
}
