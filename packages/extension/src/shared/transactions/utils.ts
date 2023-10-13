import { hexSchema } from "@argent/shared"
import { BaseTransaction } from "./interface"

export function getTransactionIdentifier(transaction: BaseTransaction): string {
  return `${transaction.networkId}::${hexSchema.parse(transaction.hash)}`
}

export function identifierToBaseTransaction(
  identifier: string,
): BaseTransaction {
  const [networkId, hashString] = identifier.split("::")
  const hash = hexSchema.parse(hashString)
  return { networkId, hash }
}
