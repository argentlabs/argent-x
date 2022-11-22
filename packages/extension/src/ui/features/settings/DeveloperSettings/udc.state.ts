import { useMemo } from "react"

import { useArrayStorage } from "../../../../shared/storage/hooks"
import { declaredTransactionsStore } from "../../../../shared/udc/store"

export const useLastDeclaredContracts = ({ limit }: { limit?: number }) => {
  const declaredTransactions = useArrayStorage(declaredTransactionsStore)

  return useMemo(() => {
    if (!limit) {
      return declaredTransactions
    }

    const limitedArray = []
    for (let i = 0; i < limit; i++) {
      limitedArray.push(declaredTransactions[i])
    }
    return declaredTransactions
  }, [declaredTransactions, limit])
}
