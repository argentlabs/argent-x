import { Permission } from "@starknet-io/types-js"
import { getIsPreauthorized } from "../messaging"

export async function getPermissionsHandler() {
  return (await getIsPreauthorized()) ? [Permission.ACCOUNTS] : []
}
