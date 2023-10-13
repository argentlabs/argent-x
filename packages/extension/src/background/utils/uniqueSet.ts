export class UniqueSet<T, K extends string | number = string> {
  protected innerSet = new Map<K, T>()

  constructor(private readonly getIdentifier: (a: T) => K) {}

  get(key: K) {
    return this.innerSet.get(key)
  }

  getAll() {
    return Array.from(this.innerSet.values())
  }

  add(value: T) {
    this.innerSet.set(this.getIdentifier(value), value)
  }

  has(key: K) {
    return this.innerSet.has(key)
  }

  delete(key: K) {
    return this.innerSet.delete(key)
  }
}
