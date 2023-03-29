import { FC } from "react"

import { ShieldHeader } from "./ui/ShieldHeader"

interface ShieldAccountNotReadyProps {
  needsUpgrade?: boolean
}

export const ShieldAccountNotReady: FC<ShieldAccountNotReadyProps> = ({
  needsUpgrade = false,
}) => {
  const action = needsUpgrade ? "upgrade" : "deploy"
  return (
    <ShieldHeader
      title={"Add Argent Shield"}
      subtitle={`You must ${action} this account before Argent Shield can be added`}
    />
  )
}
