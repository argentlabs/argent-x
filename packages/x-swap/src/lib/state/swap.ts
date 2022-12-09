import create from "zustand"

import { USDC } from "../../lib/constants"
import { DEFAULT_NETWORK_ID, SupportedNetworks } from "../../sdk/constants"

export enum Field {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
}

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }

  // actions
  selectCurrency: (params: SelectCurrency) => void
  switchCurrencies: () => void
  typeInput: (params: TypeInput) => void
  replaceSwapState: (params: ReplaceSwapState) => void
}

type SelectCurrency = {
  field: Field
  currencyId: string
}

type TypeInput = {
  field: Field
  typedValue: string
}

type ReplaceSwapState = {
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
}

const initialState = (networkId: SupportedNetworks) => ({
  independentField: Field.INPUT,
  typedValue: "",
  [Field.INPUT]: {
    currencyId: "ETH",
  },
  [Field.OUTPUT]: {
    currencyId:
      networkId === SupportedNetworks.MAINNET
        ? USDC[SupportedNetworks.MAINNET].address
        : USDC[SupportedNetworks.TESTNET].address,
  },
})

export const useSwapState = (networkId: SupportedNetworks | undefined) => {
  return create<SwapState>()((set) => ({
    ...initialState(networkId || DEFAULT_NETWORK_ID),

    // Select Currency
    selectCurrency: ({ field, currencyId }: SelectCurrency) =>
      set((state) => {
        const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
        if (currencyId === state[otherField].currencyId) {
          // the case where we have to swap the order
          return {
            ...state,
            independentField:
              state.independentField === Field.INPUT
                ? Field.OUTPUT
                : Field.INPUT,
            [field]: { currencyId: currencyId },
            [otherField]: { currencyId: state[field].currencyId },
          }
        } else {
          // the normal case
          return {
            ...state,
            [field]: { currencyId: currencyId },
          }
        }
      }),

    // Switch Currencies
    switchCurrencies: () =>
      set((state) => ({
        ...state,
        independentField:
          state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      })),

    // typeInput
    typeInput: ({ field, typedValue }: TypeInput) =>
      set((state) => {
        return {
          ...state,
          independentField: field,
          typedValue,
        }
      }),

    // replaceSwapState
    replaceSwapState: ({
      field,
      typedValue,
      inputCurrencyId,
      outputCurrencyId,
    }: ReplaceSwapState) =>
      set(() => ({
        independentField: field,
        typedValue,
        [Field.INPUT]: { currencyId: inputCurrencyId },
        [Field.OUTPUT]: { currencyId: outputCurrencyId },
      })),
  }))()
}
export default useSwapState
