// TODO: please remove in a future release
import { BigNumber } from "ethers"
import create from "zustand"
import { persist } from "zustand/middleware"

import { sendMessage } from "../../../shared/messages"
import { equalToken, parsedDefaultTokens } from "../../../shared/token"
import { isValidAddress } from "../../services/addresses"
import {
  TokenDetails,
  mapTokenDetailsToToken,
  mapTokenToTokenDetails,
} from "./tokens.state"

interface State {
  tokens: TokenDetails[]
  migrated?: boolean
}

// restore legacy tokens from localStorage
export const useTokens = create<State>(
  persist(
    () => ({
      tokens: parsedDefaultTokens.map(mapTokenToTokenDetails),
    }),
    {
      name: "tokens", // name of item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        tokens: [...currentState.tokens, ...persistedState.tokens],
      }),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).map(([key, value]) => {
            if (key === "tokens") {
              return [
                key,
                (value as TokenDetails[]).filter(
                  (token) =>
                    !parsedDefaultTokens.some((defaultToken) =>
                      equalToken(token, defaultToken),
                    ),
                ),
              ]
            }
            return [key, value]
          }),
        ),
      deserialize: (str) =>
        JSON.parse(str, (_, v) => {
          if (
            typeof v === "object" &&
            "type" in v &&
            "hex" in v &&
            v.type === "BigNumber"
          ) {
            return BigNumber.from(v.hex)
          }
          return v
        }),
    },
  ),
)

const isDataComplete = (
  data: Partial<TokenDetails>,
): data is Required<TokenDetails> => {
  if (
    data.address &&
    isValidAddress(data.address) &&
    data.decimals?.toString() &&
    data.name &&
    data.symbol
  ) {
    return true
  }
  return false
}

let invoked = false
export async function migrateUiTokensToBackground() {
  const state = useTokens.getState()
  if (!state.migrated && !invoked) {
    invoked = true
    const customTokens = state.tokens.filter(
      (token) =>
        !parsedDefaultTokens.some((defaultToken) =>
          equalToken(token, defaultToken),
        ),
    )
    const promises = customTokens.map(async (token) => {
      if (isDataComplete(token)) {
        await sendMessage({
          // lets not use the helper, so we dont wait for response (less error prone)
          type: "ADD_TOKEN",
          data: mapTokenDetailsToToken(token),
        })
      }
    })

    await Promise.allSettled(promises)
  }
  return useTokens.setState({ migrated: true })
}
