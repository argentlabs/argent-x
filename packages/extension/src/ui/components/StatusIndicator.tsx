import type { BoxProps } from "@chakra-ui/react"
import { Box, Tooltip, keyframes } from "@chakra-ui/react"

import type { ColorStatus } from "../../shared/network"
import { upperFirst } from "lodash-es"
import type { FC } from "react"

export type StatusIndicatorColor =
  | "green"
  | "orange"
  | "red"
  | "neutral"
  | "hidden"

interface StatusResponse {
  color: StatusIndicatorColor
  label?: string
  hexColor: string
}

export const networkStatusMapping: { [key in ColorStatus]: StatusResponse } = {
  red: { color: "red", hexColor: "#FF675C", label: "Very busy" },
  amber: { color: "orange", hexColor: "#FFBF3D", label: "Busy" },
  green: { color: "green", hexColor: "#08A681", label: "Live" },
  unknown: { color: "hidden", hexColor: "icon-secondary" },
}

export const transactionStatusMapping: {
  [key in ColorStatus]: StatusResponse
} = {
  red: { color: "red", hexColor: "#FF675C" },
  amber: { color: "orange", hexColor: "#FFBF3D" },
  green: { color: "green", hexColor: "#08A681" },
  unknown: { color: "hidden", hexColor: "#BFBFBF" },
}

function mapNetworkStatus(status: ColorStatus): StatusResponse {
  const response = networkStatusMapping[status]
  if (!response) {
    throw new Error(`Unexpected status: ${status}`)
  }
  return response
}

function mapTransactionStatus(status: ColorStatus): StatusResponse {
  const response = transactionStatusMapping[status]
  if (!response) {
    throw new Error(`Unexpected status: ${status}`)
  }
  return response
}

export interface StatusIndicatorProps extends BoxProps {
  status: ColorStatus
}

export const StatusIndicator: FC<StatusIndicatorProps> = ({
  status,
  ...rest
}) => {
  const { color, label, hexColor } = mapNetworkStatus(status)

  return (
    <Tooltip label={label} aria-label={label}>
      <Box
        height={2}
        width={2}
        borderRadius={8}
        data-testid={`status-indicator-${color}`}
        backgroundColor={hexColor}
        {...rest}
      />
    </Tooltip>
  )
}

const PulseAnimation = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 168, 92, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(255, 168, 92, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 168, 92, 0);
  }
`

export const TransactionStatusIndicator = ({
  status,
  label,
}: {
  status: ColorStatus
  label?: string
}) => {
  const { color, hexColor } = mapTransactionStatus(status)
  const labelUpper = upperFirst(label?.toLowerCase())
  const animation =
    status === "amber" ? `${PulseAnimation} 1.5s infinite` : undefined

  return (
    <Tooltip label={labelUpper} aria-label={labelUpper}>
      <Box
        height={2}
        width={2}
        borderRadius={8}
        backgroundColor={hexColor}
        marginRight={2}
        boxShadow={
          status === "amber" ? "0 0 0 0 rgba(255, 168, 92, 1)" : undefined
        }
        transform={status === "amber" ? "scale(1)" : undefined}
        animation={animation}
        data-testid={`transaction-status-indicator-${color}`}
      />
    </Tooltip>
  )
}
