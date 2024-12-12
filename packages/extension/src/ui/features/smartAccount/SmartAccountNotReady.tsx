import { FlowHeader, icons } from "@argent/x-ui"
import type { FC } from "react"
const { ShieldSecondaryIcon } = icons
interface SmartAccountNotReadyProps {
  needsUpgrade?: boolean
}

export const SmartAccountNotReady: FC<SmartAccountNotReadyProps> = ({
  needsUpgrade = false,
}) => {
  const action = needsUpgrade ? "upgrade" : "deploy"
  return (
    <FlowHeader
      title={"Upgrade to Smart Account"}
      subtitle={`You must ${action} this account before upgrading to a Smart Account.`}
      icon={ShieldSecondaryIcon}
    />
  )
}
