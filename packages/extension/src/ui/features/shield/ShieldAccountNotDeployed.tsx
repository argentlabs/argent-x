import { FlowHeader } from "@argent/ui"
import { FC } from "react"

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
    />
  )
}
