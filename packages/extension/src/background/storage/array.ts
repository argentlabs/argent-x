import { uniqWith } from "lodash-es"

import { IStorage } from "./interface"

export class ArrayStorage<T> {
  private compare: (a: T, b: T) => boolean
  private store: IStorage<{ inner: T[] }>
  constructor(
    defaults: T[],
    store: IStorage<{ inner: T[] }>,
    compare = (a: T, b: T) => a === b,
  ) {
    this.compare = compare
    this.store = store

    // add default values that are not already in the store
    this.getItems().then((items) => {
      const missing = defaults.filter(
        (item) => !items.some((i) => this.compare(i, item)),
      )
      return this.addItems(missing)
    })
  }

  async getItems(predicate: (item: T) => boolean = () => true): Promise<T[]> {
    const inner = await this.store.getItem("inner")
    return inner.filter(predicate)
  }

  async getItem(predicate: (item: T) => boolean): Promise<T | null> {
    const inner = await this.store.getItem("inner")
    return inner.find(predicate) ?? null
  }

  async addItems(values: T[]): Promise<void> {
    const inner = await this.store.getItem("inner")
    const newInner = uniqWith(
      [
        ...values.reverse(), // reverse so last element takes priority over first occurrence of same value
        ...inner,
      ],
      this.compare,
    )
    return this.store.setItem("inner", newInner)
  }

  async addItem(value: T): Promise<void> {
    return this.addItems([value])
  }

  async removeItem(filterFn: (item: T) => boolean): Promise<void> {
    const inner = await this.store.getItem("inner")
    const newInner = inner.filter(filterFn)
    return this.store.setItem("inner", newInner)
  }
}
