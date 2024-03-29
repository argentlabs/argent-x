import { IDebounceService } from "../../../../../shared/debounce"
import { IScheduleService } from "../../../../../shared/schedule/interface"
import { Locked } from "../../../../wallet/session/interface"
import { WalletSessionService } from "../../../../wallet/session/session.service"
import { IKeyValueStorage } from "../../../../../shared/storage"
import { WalletStorageProps } from "../../../../wallet/backup/backup.service"
import { IBackgroundUIService, Opened } from "../../ui/interface"
import { pipe } from "./pipe"

type Fn = (...args: unknown[]) => Promise<void>

export const onAccountChanged =
  <T extends Fn>(walletStore: IKeyValueStorage<WalletStorageProps>) =>
  (fn: T): T => {
    walletStore.subscribe("selected", fn)

    return fn
  }

/**
 * Function to schedule a task on startup.
 * @param {IScheduleService} scheduleService - The schedule service.
 * @returns {Function} The scheduled function.
 */
export const onStartup =
  <T extends Fn>(scheduleService: IScheduleService) =>
  (fn: T): T => {
    const id = `onStartup`
    void scheduleService.onStartup({
      id,
      callback: fn,
    })

    return fn
  }

/**
 * Function to schedule a task on install and upgrade.
 * @param {IScheduleService} scheduleService - The schedule service.
 * @returns {Function} The scheduled function.
 */
export const onInstallAndUpgrade =
  <T extends Fn>(scheduleService: IScheduleService) =>
  (fn: T): T => {
    const id = `onInstalled`
    void scheduleService.onInstallAndUpgrade({
      id,
      callback: fn,
    })

    return fn
  }

/**
 * Function to schedule a task to run every specified seconds.
 * @param {IScheduleService} scheduleService - The schedule service.
 * @param {number} seconds - The interval in seconds.
 * @returns {Function} The scheduled function.
 */
export const every =
  <T extends Fn>(
    scheduleService: IScheduleService,
    seconds: number,
    name: string,
  ) =>
  (fn: T): T => {
    const id = `every@${seconds}s:${name}`
    void scheduleService
      .registerImplementation({
        id,
        callback: fn,
      })
      .then(() => scheduleService.every(seconds, { id }))

    return fn
  }

export type MinimalIBackgroundUIService = Pick<
  IBackgroundUIService,
  "opened" | "emitter"
>

export type MinimalWalletSessionService = Pick<
  WalletSessionService,
  "locked" | "emitter"
>
/**
 * Function to schedule a task to run when the UI is opened.
 * @param {IBackgroundUIService} backgroundUIService - The background UI service.
 * @returns {Function} The scheduled function.
 */
export const onOpen =
  <T extends Fn>(backgroundUIService: MinimalIBackgroundUIService) =>
  (fn: T): T => {
    backgroundUIService.emitter.on(Opened, async (open) => {
      if (open) {
        await fn()
      }
    })

    return fn
  }

export const onClose =
  <T extends Fn>(backgroundUIService: MinimalIBackgroundUIService) =>
  (fn: T): T => {
    backgroundUIService.emitter.on(Opened, async (open) => {
      if (!open) {
        await fn()
      }
    })

    return fn
  }

export const onUnlocked =
  <T extends Fn>(sessionService: MinimalWalletSessionService) =>
  (fn: T): T => {
    sessionService.emitter.on(Locked, async (locked) => {
      if (!locked) {
        await fn()
      }
    })

    return fn
  }

export const onlyIfUnlocked =
  <T extends Fn>(sessionService: MinimalWalletSessionService) =>
  (fn: T): T => {
    return ((...args: unknown[]) => {
      return !sessionService.locked ? fn(...args) : noopAs(fn)(...args)
    }) as T
  }

function noopAs<T extends Fn>(_fn: T): T {
  const noop = () => {}
  return noop as T
}
/**
 * only run the decorated function if the UI is open
 *
 * @dev this decorator needs to go last in most cases!
 * @param backgroundUIService - the background UI service
 * @returns the decorated function
 */
export const onlyIfOpen =
  <T extends Fn>(backgroundUIService: MinimalIBackgroundUIService) =>
  (fn: T): T => {
    return ((...args: unknown[]) => {
      return backgroundUIService.opened ? fn(...args) : noopAs(fn)(...args)
    }) as T
  }

/**
 * Function to debounce a task.
 * @param {IDebounceService} debounceService - The debounce service.
 * @param {number} seconds - The debounce time in seconds.
 * @returns {Promise<void>} The debounced function.
 */
export const debounce =
  <T extends Fn>(
    debounceService: IDebounceService,
    seconds: number,
    name: string,
  ) =>
  (fn: T): (() => Promise<void>) => {
    const id = `debounce@${seconds}s:${name}`
    const task = { id, callback: fn, debounce: seconds }

    return () => {
      return debounceService.debounce(task)
    }
  }

/**
 * Function to schedule a task to run every specified seconds when the UI is opened.
 * @param {IBackgroundUIService} backgroundUIService - The background UI service.
 * @param {IScheduleService} scheduleService - The schedule service.
 * @param {IDebounceService} debounceService - The debounce service.
 * @param {number} seconds - The interval in seconds.
 * @returns {Function} The scheduled function.
 */
export const everyWhenOpen = (
  backgroundUIService: MinimalIBackgroundUIService,
  scheduleService: IScheduleService,
  debounceService: IDebounceService,
  seconds: number,
  name: string,
) => {
  return pipe(
    debounce(debounceService, seconds, name),
    onlyIfOpen(backgroundUIService),
    onOpen(backgroundUIService),
    onInstallAndUpgrade(scheduleService),
    every(scheduleService, seconds, name),
  )
}

/**
 * Function to run a task when the wallet is opened and unlocked, debounced by specified seconds
 */

export const whenOpenAndUnlocked = (
  backgroundUIService: MinimalIBackgroundUIService,
  sessionService: MinimalWalletSessionService,
  debounceService: IDebounceService,
  seconds: number,
  name: string,
) => {
  return pipe(
    debounce(debounceService, seconds, name),
    onlyIfOpen(backgroundUIService),
    onlyIfUnlocked(sessionService),
    onOpen(backgroundUIService),
    onUnlocked(sessionService),
  )
}

/**
 * Function to schedule a task to run every specified seconds when the UI is opened and unlocked
 */

export const everyWhenOpenAndUnlocked = (
  backgroundUIService: MinimalIBackgroundUIService,
  scheduleService: IScheduleService,
  sessionService: MinimalWalletSessionService,
  debounceService: IDebounceService,
  seconds: number,
  name: string,
) => {
  return pipe(
    debounce(debounceService, seconds, name),
    onlyIfOpen(backgroundUIService),
    onlyIfUnlocked(sessionService),
    onOpen(backgroundUIService),
    onUnlocked(sessionService),
    onInstallAndUpgrade(scheduleService),
    every(scheduleService, seconds, name),
  )
}
