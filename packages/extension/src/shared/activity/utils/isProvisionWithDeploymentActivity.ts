import { isEqualAddress } from "@argent/shared"
import { Activity } from "../schema"

export const isProvisionWithDeploymentActivity = (activity: Activity) => {
  return (
    activity.type === "multicall" &&
    activity.details.calls?.some(
      (call) =>
        call?.details?.type === "deploy" &&
        isEqualAddress(call?.details.contractAddress || "", activity.wallet),
    )
  )
}
