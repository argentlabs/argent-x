import type { IDebounceService } from "."

export const getMockDebounceService = (): IDebounceService => {
  const isRunning: Record<string, boolean> = {}
  const lastRun: Record<string, number> = {}

  return {
    debounce: vi.fn(async (params) => {
      if (isRunning[params.id]) {
        return
      }
      isRunning[params.id] = true
      await new Promise((resolve) => setTimeout(resolve, params.debounce))
      await params.callback()
      lastRun[params.id] = Date.now()
      isRunning[params.id] = false
    }),
    isRunning: vi.fn(({ id }) => isRunning[id]),
    lastRun: vi.fn(async ({ id }) => lastRun[id]),
  }
}
