import { FeeEstimationText } from "@argent-x/extension/src/ui/features/actions/feeEstimation/ui/FeeEstimationText"

export default {
  component: FeeEstimationText,
}

const tooltipText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor."

const wrap = {
  primaryText: "≈ 0.000000000000021 ETH",
  secondaryText: "(Max 0.000000000000063 ETH)",
}

const noWrap = {
  primaryText: "≈ 0.00021 ETH",
  secondaryText: "(Max 0.00063 ETH)",
}

export const Default = {
  args: {},
}

export const Loading = {
  args: {
    isLoading: true,
  },
}

export const NoWrap = {
  args: {
    ...noWrap,
    tooltipText,
  },
}

export const Wrap = {
  args: {
    ...wrap,
    tooltipText,
  },
}

export const CombinedNoWrap = {
  args: {
    ...noWrap,
    tooltipText,
    title: "Network fees",
    subtitle: "Includes one-time activation fee",
  },
}

export const CombinedWrap = {
  args: {
    ...wrap,
    tooltipText,
    title: "Network fees",
    subtitle: "Includes one-time activation fee",
  },
}

export const CombinedWrapError = {
  args: {
    ...wrap,
    colorScheme: "error",
    tooltipText,
    title: "Network fees",
    subtitle: "Includes one-time activation fee",
  },
}
