import type { Device } from "@argent/x-guardian"
import type Emittery from "emittery"
import type { Events } from "./ISmartAccountService"
import { IsSignedIn } from "./ISmartAccountService"
import type { ISmartAccountService } from "./ISmartAccountService"
import { checkTokenExpiry } from "./utils/tokenExpiry"
import type { StoreDexie } from "./idb"

export default class SmartAccountService implements ISmartAccountService {
  private _isSignedIn: boolean | null = null

  constructor(
    readonly emitter: Emittery<Events>,
    idb: StoreDexie,
  ) {
    void idb.devices.get(0).then(this.handleDeviceUpdate)
  }

  public handleDeviceUpdate = async (device?: Device) => {
    if (device?.verifiedEmail) {
      const { expired } = await checkTokenExpiry({
        initiator: "SmartAccountService/handleDeviceUpdate",
      })
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
