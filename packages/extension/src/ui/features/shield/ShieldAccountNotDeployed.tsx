import { FlowHeader, icons } from "@argent/ui"
import { FC } from "react"
const { ArgentShieldIcon } = icons
interface ShieldAccountNotReadyProps {
  needsUpgrade?: boolean
}

export const ShieldAccountNotReady: FC<ShieldAccountNotReadyProps> = ({
  needsUpgrade = false,
}) => {
  const action = needsUpgrade ? "upgrade" : "deploy"
  return (
    <FlowHeader
      title={"Add Argent Shield"}
      subtitle={`You must ${action} this account before Argent Shield can be added`}
      icon={ArgentShieldIcon}
    />
  )
}
