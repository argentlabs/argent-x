import { atom, getDefaultStore } from "jotai"
import type { Atom, WritableAtom } from "jotai"

const defaultStore = getDefaultStore()

// heavily inspired by https://github.com/pmndrs/jotai/blob/main/src/vanilla/utils/atomWithObservable.ts

type Subscription = () => void

type Options<Data> = {
  initialValue?: Data | (() => Data)
}

type OptionsWithInitialValue<Data> = {
  initialValue: Data | (() => Data)
}

export function atomWithSubscription<Data>(
  getData: () => Data,
  subscribe: (next: (data: Data) => void) => Subscription,
  options: OptionsWithInitialValue<Data>,
): WritableAtom<Data, [Data], void>

export function atomWithSubscription<Data>(
  getData: () => Promise<Data>,
  subscribe: (next: (data: Data) => void) => Subscription,
  options?: Options<Data>,
): WritableAtom<Data | Promise<Data>, [Data], void>

export function atomWithSubscription<Data>(
  getData: () => Promise<Data>,
  subscribe: (next: (data: Data) => void) => Subscription,
  options: OptionsWithInitialValue<Data>,
): Atom<Data>

export function atomWithSubscription<Data>(
  getData: () => Promise<Data>,
  subscribe: (next: (data: Data) => void) => Subscription,
  options?: Options<Data>,
): Atom<Data | Promise<Data>>

export function atomWithSubscription<Data>(
  getData: () => Promise<Data> | Data,
  subscribe: (next: (data: Data) => void) => Subscription,
  options?: Options<Data>,
) {
  type Result = Data

  const initialResult: Result | Promise<Result> =
    options && "initialValue" in options
      ? typeof options.initialValue === "function"
        ? (options.initialValue as () => Data)()
        : (options.initialValue as Data)
      : getData()

  const resultAtom = atom(initialResult)

  /** TODO: currenlty `atomWithSubscription` is used in root outside React - there is no lifecycle method to unsubscribe */
  const listener = (result: Result) => {
    defaultStore.set(resultAtom, result)
  }
  subscribe(listener)

  return resultAtom
}
