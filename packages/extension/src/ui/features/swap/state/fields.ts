import { Address } from "@argent/shared"
import { create } from "zustand"
import { ETH, USDC } from "../../../../shared/token/__new/constants"
import { constants } from "starknet"
import { defaultNetwork } from "../../../../shared/network"

export enum Field {
  PAY = "PAY",
  RECEIVE = "RECEIVE",
}

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.PAY]: {
    readonly tokenAddress: Address | undefined
  }
  readonly [Field.RECEIVE]: {
    readonly tokenAddress: Address | undefined
  }

  // actions
  selectToken: (params: SelectToken) => void
  switchTokens: () => void
  typeInput: (params: TypeInput) => void
  replaceSwapState: (params: ReplaceSwapState) => void
  resetIndependentField: () => void
}

type SelectToken = {
  field: Field
  tokenAddress: Address
}

type TypeInput = {
  field: Field
  typedValue: string
}

type ReplaceSwapState = {
  field: Field
  typedValue: string
  payTokenAddress?: Address
  receiveTokenAddress?: Address
}

const defaultNetworkChainId =
  defaultNetwork.id === "mainnet-alpha"
    ? constants.StarknetChainId.SN_MAIN
    : constants.StarknetChainId.SN_GOERLI

export const initialState = {
  independentField: Field.PAY,
  typedValue: "",
  [Field.PAY]: {
    tokenAddress: ETH[defaultNetworkChainId].address,
  },
  [Field.RECEIVE]: {
    tokenAddress: USDC[defaultNetworkChainId].address,
  },
}

export const useSwapState = create<SwapState>()((set) => ({
  ...initialState,

  // Select Token
  selectToken: ({ field, tokenAddress }: SelectToken) =>
    set((state) => {
      const otherField = field === Field.PAY ? Field.RECEIVE : Field.PAY
      if (tokenAddress === state[otherField].tokenAddress) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField:
            state.independentField === Field.PAY ? Field.RECEIVE : Field.PAY,
          [field]: { tokenAddress },
          [otherField]: { tokenAddress: state[field].tokenAddress },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { tokenAddress },
        }
      }
    }),

  // Switch Currencies
  switchTokens: () =>
    set((state) => ({
      ...state,
      // independentField: Field.PAY, // for now backend only supports trade from a Pay amount. Uncomment the line below when backend supports trade from a Receive amount as well
      independentField:
        state.independentField === Field.PAY ? Field.RECEIVE : Field.PAY,
      [Field.PAY]: { tokenAddress: state[Field.RECEIVE].tokenAddress },
      [Field.RECEIVE]: { tokenAddress: state[Field.PAY].tokenAddress },
    })),

  // typeInput
  typeInput: ({ field, typedValue }: TypeInput) =>
    set((state) => {
      return {
        ...state,
        // for now backend only supports trade from a Pay amount. Uncomment the line below when backend supports trade from a Receive amount as well
        // independentField: Field.PAY,
        independentField: field,
        typedValue,
      }
    }),

  // replaceSwapState
  replaceSwapState: ({
    field,
    typedValue,
    payTokenAddress,
    receiveTokenAddress,
  }: ReplaceSwapState) =>
    set(() => ({
      independentField: field,
      typedValue,
      [Field.PAY]: { tokenAddress: payTokenAddress },
      [Field.RECEIVE]: { tokenAddress: receiveTokenAddress },
    })),

  resetIndependentField: () =>
    set((state) => ({
      ...state,
      independentField: Field.PAY,
    })),
}))
