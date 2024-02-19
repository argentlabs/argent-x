import { Activity } from "../schema"

export const parseProvisionActivity = (
  activities: Activity[],
): Activity | undefined => {
  let activityWithProvision: Activity | undefined

  const successfulActivities = activities.filter(
    (activity) => activity.status === "success",
  )
  const multicallActivities = successfulActivities.filter(
    (activity) => activity.type === "multicall",
  )

  const nonMulticallActivities = successfulActivities.filter(
    (activity) => activity.type !== "multicall",
  )
  multicallActivities.forEach((multicallActivity) => {
    const callWithProvision = multicallActivity.details.calls?.find(
      (call) => call.details?.context?.isProvisionAirdrop,
    )
    if (callWithProvision) {
      activityWithProvision = multicallActivity
    }
  })
  nonMulticallActivities.forEach((nonMulticallActivity) => {
    if (nonMulticallActivity.details?.context?.isProvisionAirdrop) {
      activityWithProvision = nonMulticallActivity
    }
  })
  return activityWithProvision
}
