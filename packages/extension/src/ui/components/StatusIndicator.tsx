import { FC } from "react"
import styled, { css, keyframes } from "styled-components"

import { NetworkStatus } from "../../shared/networks"
import type { AccountStatusCode } from "../utils/accounts"
import { NetworkWarning } from "./Icons/NetworkWarning"

export type StatusIndicatorStatus = "green" | "orange" | "red" | "transparent"

interface StatusIndicatorProps {
  status?: StatusIndicatorStatus
}

export function mapAccountStatusCodeToColor(
  status: AccountStatusCode,
): StatusIndicatorStatus {
  switch (status) {
    case "CONNECTED":
      return "green"
    case "DEPLOYING":
      return "orange"
    case "ERROR":
      return "red"
    default:
      return "transparent"
  }
}

export function mapNetworkStatusToColor(
  status?: NetworkStatus,
): StatusIndicatorStatus {
  switch (status) {
    case "error":
      return "red"
    case "degraded":
      return "orange"
    case "ok": // network status shows green by default and has no transparent state
    default:
      return "green"
  }
}

export const StatusIndicator = styled.span<StatusIndicatorProps>`
  height: 8px;
  width: 8px;
  border-radius: 8px;

  background-color: ${({ status = "transparent" }) =>
    status === "green"
      ? "#02BBA8"
      : status === "orange"
      ? "#ffa85c"
      : status === "red"
      ? "#C12026"
      : "transparent"};
`

export const NetworkStatusIndicator: FC<StatusIndicatorProps> = ({
  status = "transparent",
}) => {
  if (status === "orange") {
    return <NetworkWarning />
  }
  return <StatusIndicator status={status} />
}

export const AccountStatusIndicator = styled(StatusIndicator)``

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

  ${({ status = "CONNECTED" }) =>
    status === "DEPLOYING" &&
    css`
      box-shadow: 0 0 0 0 rgba(255, 168, 92, 1);
      transform: scale(1);
      animation: ${PulseAnimation} 1.5s infinite;
    `}
`
