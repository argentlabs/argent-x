import { argentDb } from "@argent-x/extension/src/shared/idb/argentDb"
import React, { useEffect, useState } from "react"
import { tokenPrices } from "./tokenPrices"
import { tokens } from "./tokens"
import { tokensInfo } from "./tokensInfo"

export const ArgentDbDecorator = (Story: React.ComponentType) => {
  const [isDbInitialized, setIsDbInitialized] = useState(false)

  useEffect(() => {
    const initDb = async () => {
      await argentDb.tokensInfo.bulkPut(tokensInfo)
      await argentDb.tokenPrices.bulkPut(tokenPrices)
      await argentDb.tokens.bulkPut(tokens)
      setIsDbInitialized(true)
    }
    void initDb()
  }, [])

  if (!isDbInitialized) {
    return <div>Loading...</div>
  }

  return <Story />
}
