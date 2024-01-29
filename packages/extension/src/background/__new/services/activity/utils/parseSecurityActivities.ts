import { type Address, includesAddress } from "@argent/shared"

import type { Activity, ActivityDetailsAction } from "../schema"

interface ParseFinanceActivitiesProps {
  activities: Activity[]
  accountAddressesOnNetwork: Address[]
}

/**
 * Parses security-related activities from the provided list of activities, grouping them by action
 * and returning a map of addresses associated with each action.
 *
 * @param activities: Array of activities to parse.
 * @param accountAddressesOnNetwork: Array of account addresses that are known to be active on the
 * network.
 * @returns A map of actions to their associated addresses, where the addresses represent the
 * accounts involved in the respective actions.
 */

export function parseSecurityActivities({
  activities,
  accountAddressesOnNetwork,
}: ParseFinanceActivitiesProps) {
  const accountAddressesByAction: Partial<
    Record<ActivityDetailsAction, Address[]>
  > = {}

  activities.forEach((activity) => {
    if (activity.group === "security") {
      const address = activity.wallet
      if (includesAddress(address, accountAddressesOnNetwork)) {
        const action = activity.details.action
        if (action) {
          if (!accountAddressesByAction[action]) {
            accountAddressesByAction[action] = []
          }
          if (!includesAddress(address, accountAddressesByAction[action])) {
            accountAddressesByAction[action]?.push(address)
          }
        }
      }
    }
  })

  return accountAddressesByAction
}
