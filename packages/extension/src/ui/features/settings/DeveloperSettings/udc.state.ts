import { useMemo } from "react"

import { useArrayStorage } from "../../../../shared/storage/hooks"
import { declaredTransactionsStore } from "../../../../shared/udc/store"

export const useLastDeclaredContracts = ({ limit }: { limit?: number }) => {
  const declaredTransactions = useArrayStorage(declaredTransactionsStore)

  return useMemo(() => {
    if (!limit) {
      return declaredTransactions.reverse()
    }

    const length = declaredTransactions.length
    const checkLimit = length < limit ? length : limit

    const limitedArray = []
    for (let i = 0; i < checkLimit; i++) {
      limitedArray.unshift(declaredTransactions[i])
    }

    return limitedArray
  }, [declaredTransactions, limit])
}
