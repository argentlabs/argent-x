import { IStorage } from "./interface"

export class ArrayStorage<T> {
  private compareFn: (a: T, b: T) => boolean
  private store: IStorage<{ inner: T[] }>
  constructor(
    defaults: T[],
    store: IStorage<{ inner: Array<T> }>,
    compareFn = (a: T, b: T) => a === b,
  ) {
    this.compareFn = compareFn
    this.store = store
    this.addItems(defaults)
  }

  async getItems(filterFn: (item: T) => boolean = () => true): Promise<T[]> {
    const inner = await this.store.getItem("inner")
    return inner.filter(filterFn)
  }

  async getItem(findFn: (item: T) => boolean): Promise<T | null> {
    const inner = await this.store.getItem("inner")
    return inner.find(findFn) ?? null
  }

  async addItems(values: T[]): Promise<void> {
    const inner = await this.store.getItem("inner")
    const uniqueValues = values.filter(
      // remove duplicates from the array
      (value, index) =>
        index ===
        [...values].reverse().findIndex((v) => this.compareFn(v, value)),
    )
    const newInner = [
      ...inner.filter(
        (item) => !uniqueValues.find((value) => this.compareFn(item, value)),
      ),
      ...uniqueValues,
    ]
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
