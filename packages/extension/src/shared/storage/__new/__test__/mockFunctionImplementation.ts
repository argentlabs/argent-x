import { vi } from "vitest"

import { IObjectStore, IRepository } from "../interface"

export class MockFnObjectStore<T> implements IObjectStore<T> {
  public namespace = "test:mockFnObjectStore"
  get = vi.fn()
  set = vi.fn()
  subscribe = vi.fn()
}

export class MockFnRepository<T> implements IRepository<T> {
  public namespace = "test:mockFnRepository"
  get = vi.fn()
  upsert = vi.fn()
  subscribe = vi.fn()
  remove = vi.fn()
}
