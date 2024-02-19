import { Activity } from "../schema"

export const hasDelegationActivity = (activity: Activity) => {
  const hasDelegation = activity.details?.calls?.some((call) => {
    if (call?.details?.function?.name) {
      return call?.details?.function.name === "lock_and_delegate_by_sig"
    }
    return false
  })
  return Boolean(hasDelegation)
}
