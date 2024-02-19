import { Box, Tooltip } from "@chakra-ui/react"

import styled, { css, keyframes } from "styled-components"

import { NetworkStatus } from "../../shared/network"

export type StatusIndicatorColor =
  | "green"
  | "orange"
  | "red"
  | "neutral"
  | "hidden"

interface NetworkStatusResponse {
  color: StatusIndicatorColor
  label?: string
  hexColor: string
}

export const statusMapping: { [key in NetworkStatus]: NetworkStatusResponse } =
  {
    red: { color: "red", hexColor: "#FF675C", label: "Very busy" },
    amber: { color: "orange", hexColor: "#FFBF3D", label: "Busy" },
    green: { color: "green", hexColor: "#08A681", label: "Live" },
    unknown: { color: "hidden", hexColor: "#BFBFBF" },
  }

function mapNetworkStatus(status: NetworkStatus): NetworkStatusResponse {
  const response = statusMapping[status]
  if (!response) {
    throw new Error(`Unexpected status: ${status}`)
  }
  return response
}

export const StatusIndicator = ({ status }: { status: NetworkStatus }) => {
  const { color, label, hexColor } = mapNetworkStatus(status)

  return (
    <Tooltip label={label} aria-label={label}>
      <Box
        height={2}
        width={2}
        borderRadius={8}
        data-testid={`status-indicator-${color}`}
        backgroundColor={hexColor}
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

export const TransactionStatusIndicator = styled(StatusIndicator)`
  margin-right: 8px;

  ${({ status }) =>
    status === "amber" &&
    css`
      box-shadow: 0 0 0 0 rgba(255, 168, 92, 1);
      transform: scale(1);
      animation: ${PulseAnimation} 1.5s infinite;
    `}
`
