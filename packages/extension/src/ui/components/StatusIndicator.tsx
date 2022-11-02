import { FC } from "react"
import styled, { css, keyframes } from "styled-components"

import { NetworkStatus } from "../../shared/network"
import { assertNever } from "../services/assertNever"
import { NetworkWarningIcon } from "./Icons/NetworkWarningIcon"

export type StatusIndicatorColor = "green" | "orange" | "red" | "transparent"

interface StatusIndicatorProps {
  color?: StatusIndicatorColor
}

export function mapNetworkStatusToColor(
  status?: NetworkStatus,
): StatusIndicatorColor {
  switch (status) {
    case "error":
      return "red"
    case "degraded":
      return "orange"
    case "ok": // network status shows green by default and has no transparent state
    case "unknown":
    case undefined:
      return "green"
    default:
      assertNever(status)
      return "green"
  }
}

export const StatusIndicator = styled.span<StatusIndicatorProps>`
  height: 8px;
  width: 8px;
  border-radius: 8px;

  background-color: ${({ color = "transparent" }) =>
    color === "green"
      ? "#02BBA8"
      : color === "orange"
      ? "#ffa85c"
      : color === "red"
      ? "#C12026"
      : "transparent"};
`

export const NetworkStatusIndicator: FC<StatusIndicatorProps> = ({
  color = "transparent",
}) => {
  if (color === "orange") {
    return <NetworkWarningIcon />
  }
  return <StatusIndicator color={color} />
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

  ${({ color }) =>
    color === "orange" &&
    css`
      box-shadow: 0 0 0 0 rgba(255, 168, 92, 1);
      transform: scale(1);
      animation: ${PulseAnimation} 1.5s infinite;
    `}
`
