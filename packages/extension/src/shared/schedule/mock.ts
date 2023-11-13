import { IScheduleService } from "./interface"

export const createScheduleServiceMock = (): IScheduleService => {
  const service: IScheduleService = {
    delete: vi.fn(() => Promise.resolve()),
    in: vi.fn(() => Promise.resolve()),
    every: vi.fn(() => Promise.resolve()),
    onInstallAndUpgrade: vi.fn(() => Promise.resolve()),
    onStartup: vi.fn(() => Promise.resolve()),
    registerImplementation: vi.fn(() => Promise.resolve()),
  }
  return service
}
