import { IDebounceService } from "."

export const getMockDebounceService = (): IDebounceService => {
  return {
    debounce: vi.fn(() => Promise.resolve()),
    isRunning: vi.fn(),
    lastRun: vi.fn(),
  }
}
