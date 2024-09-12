import { FlowHeader, iconsDeprecated } from "@argent/x-ui"
import { FC } from "react"
const { SmartAccountActiveIcon } = iconsDeprecated
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
      icon={SmartAccountActiveIcon}
    />
  )
}
