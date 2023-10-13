import { atom } from "jotai"
import type { Atom, Getter, WritableAtom } from "jotai"

// heavily inspired by https://github.com/pmndrs/jotai/blob/main/src/vanilla/utils/atomWithObservable.ts
// should maybe be a PR to jotai

type Subscription = () => void

type Options<Data> = {
  initialValue?: Data | (() => Data)
}

type OptionsWithInitialValue<Data> = {
  initialValue: Data | (() => Data)
}

export function atomWithSubscription<Data>(
  getData: (get: Getter) => Data,
  subscribe: (next: (data: Data) => void) => Subscription,
  options: OptionsWithInitialValue<Data>,
): WritableAtom<Data, [Data], void>

export function atomWithSubscription<Data>(
  getData: (get: Getter) => Promise<Data>,
  subscribe: (next: (data: Data) => void) => Subscription,
  options?: Options<Data>,
): WritableAtom<Data | Promise<Data>, [Data], void>

export function atomWithSubscription<Data>(
  getData: (get: Getter) => Promise<Data>,
  subscribe: (next: (data: Data) => void) => Subscription,
  options: OptionsWithInitialValue<Data>,
): Atom<Data>

export function atomWithSubscription<Data>(
  getData: (get: Getter) => Promise<Data>,
  subscribe: (next: (data: Data) => void) => Subscription,
  options?: Options<Data>,
): Atom<Data | Promise<Data>>

export function atomWithSubscription<Data>(
  getData: (get: Getter) => Promise<Data> | Data,
  subscribe: (next: (data: Data) => void) => Subscription,
  options?: Options<Data>,
) {
  type Result = Data

  const observableResultAtom = atom((get) => {
    const initialResult: Result | Promise<Result> =
      options && "initialValue" in options
        ? typeof options.initialValue === "function"
          ? (options.initialValue as () => Data)()
          : (options.initialValue as Data)
        : getData(get)

    let setResult: ((result: Result) => void) | undefined
    let lastResult: Result | undefined
    const listener = (result: Result) => {
      lastResult = result
      setResult?.(result)
    }

    let subscription: Subscription | undefined
    const start = () => {
      if (subscription) {
        subscription()
      }
      subscription = subscribe(listener)
    }

    const resultAtom = atom(lastResult || initialResult)

    resultAtom.onMount = (update) => {
      setResult = update
      if (lastResult) {
        update(lastResult)
      }
      if (!subscription) {
        start()
      }
      return () => {
        setResult = undefined
        if (subscription) {
          subscription()
          subscription = undefined
        }
      }
    }
    return resultAtom
  })

  const observableAtom = atom((get) => {
    const resultAtom = get(observableResultAtom)
    const result = get(resultAtom)
    return result
  })

  return observableAtom
}
