import { useCallback } from "react"
import type { BaseToken } from "../../../../shared/token/__new/types/token.model"
import type { Field } from "../state/fields"
import { useSwapState } from "../state/fields"

export function useSwapActionHandlers(): {
  onTokenSelection: (field: Field, token: BaseToken) => void
  onSwitchTokens: (independentFieldInput: string) => void
  onUserInput: (field: Field, typedValue: string) => void
} {
  const { selectToken, switchTokens, typeInput, resetIndependentField } =
    useSwapState()

  const onTokenSelection = useCallback(
    (field: Field, token: BaseToken) => {
      selectToken({
        field,
        tokenAddress: token.address,
      })
    },
    [selectToken],
  )

  const onSwitchTokens = useCallback(
    (independentFieldInput: string) => {
      switchTokens({ independentFieldInput })
      resetIndependentField() // Required to force the backend to recalculate the quote
    },
    [resetIndependentField, switchTokens],
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      typeInput({ field, typedValue })
    },
    [typeInput],
  )

  return {
    onSwitchTokens,
    onTokenSelection,
    onUserInput,
  }
}
