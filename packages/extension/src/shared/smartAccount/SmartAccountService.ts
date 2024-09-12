import { liveQuery } from "dexie"
import type { Device } from "@argent/x-guardian"
import Emittery from "emittery"

import { StoreDexie } from "./idb"
import { isTokenExpired } from "./backend/account"
import {
  Events,
  IsSignedIn,
  type ISmartAccountService,
} from "./ISmartAccountService"

export default class SmartAccountService implements ISmartAccountService {
  private _isSignedIn: boolean | null = null

  constructor(
    readonly emitter: Emittery<Events>,
    idb: StoreDexie,
  ) {
    const device = liveQuery(() => idb.devices.get(0))
    device.subscribe({
      next: (result) => void this.onDeviceChange(result),
      error: (error) => console.error(error),
    })
  }

  private async onDeviceChange(device?: Device) {
    if (device?.verifiedEmail) {
      const expired = await isTokenExpired()
      this.isSignedIn = !expired
    } else {
      this.isSignedIn = false
    }
  }

  get isSignedIn() {
    return this._isSignedIn
  }

  private set isSignedIn(isSignedIn: boolean | null) {
    if (this._isSignedIn === isSignedIn || isSignedIn === null) {
      return
    }
    this._isSignedIn = isSignedIn
    void this.emitter.emit(IsSignedIn, isSignedIn)
  }
}
