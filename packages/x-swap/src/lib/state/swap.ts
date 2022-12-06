import create from "zustand"

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

const initialState = {
  independentField: Field.INPUT,
  typedValue: "",
  [Field.INPUT]: {
    currencyId: "ETH",
  },
  [Field.OUTPUT]: {
    currencyId:
      "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
  },
}

export const useSwapState = create<SwapState>()((set) => ({
  ...initialState,

  // Select Currency
  selectCurrency: ({ field, currencyId }: SelectCurrency) =>
    set((state) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField:
            state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
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
}))

export default useSwapState
