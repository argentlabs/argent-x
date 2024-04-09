import { Permission } from "@argent/x-window"
import { getIsPreauthorized } from "../messaging"

export async function getPermissionsHandler() {
  return (await getIsPreauthorized()) ? [Permission.Accounts] : []
}
