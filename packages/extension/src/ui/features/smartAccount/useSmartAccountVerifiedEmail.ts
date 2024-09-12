import { useLiveQuery } from "dexie-react-hooks"

import { idb } from "../../../shared/smartAccount/idb"

/**
 * Hook which returns the current verifiedEmail, updated live
 * @returns `null` when initialising, `undefined` when known but not set, otherwise email
 */

export const useSmartAccountVerifiedEmail = () => {
  const device = useLiveQuery(() => idb.devices.get(0), [], null)
  return device === null ? null : device?.verifiedEmail
}
