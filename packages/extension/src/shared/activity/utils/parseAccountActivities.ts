import { type Address, ensureArray, includesAddress } from "@argent/x-shared"

import type { Activity, ActivityDetailsAction } from "../schema"
import { isProvisionWithDeploymentActivity } from "./isProvisionWithDeploymentActivity"

interface ParseAccountActivitiesProps {
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

export function parseAccountActivities({
  activities,
  accountAddressesOnNetwork,
}: ParseAccountActivitiesProps) {
  const accountAddressesByAction: Partial<
    Record<ActivityDetailsAction | "deploy", Address[]>
  > = {}

  activities.forEach((activity) => {
    const address = activity.wallet
    const action =
      activity.type === "deploy" ? activity.type : activity.details.action

    if (
      activity.group === "security" &&
      includesAddress(address, accountAddressesOnNetwork) &&
      action
    ) {
      accountAddressesByAction[action] = accountAddressesByAction[action] || []
      if (!includesAddress(address, accountAddressesByAction[action])) {
        accountAddressesByAction[action] = ensureArray(
          accountAddressesByAction[action],
        ).concat(address)
      }
    }
    // This is to cover the case where starknet uses a multicall to deploy an account and provision it in the same transaction
    if (isProvisionWithDeploymentActivity(activity)) {
      accountAddressesByAction["deploy"] = ensureArray(
        accountAddressesByAction["deploy"],
      ).concat(address)
    }
  })

  return accountAddressesByAction
}
