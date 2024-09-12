import Emittery from "emittery"

import { Events } from "./ISmartAccountService"
import SmartAccountService from "./SmartAccountService"
import { idb } from "./idb"

const emitter = new Emittery<Events>()

export const smartAccountService = new SmartAccountService(emitter, idb)
