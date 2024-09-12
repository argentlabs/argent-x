import { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"

export const getRelatedTokensFromReview = (
  transactions: EnrichedSimulateAndReview["transactions"],
): `0x${string}`[] => {
  return transactions
    .flatMap(
      (tx) =>
        tx.simulation?.summary?.map((summary) => summary.token.address) || [],
    )
    .filter((address): address is `0x${string}` => Boolean(address))
}
