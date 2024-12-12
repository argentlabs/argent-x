import type Emittery from "emittery"

export const IsSignedIn = Symbol("IsSignedIn")

export type Events = {
  [IsSignedIn]: boolean
}

export interface ISmartAccountService {
  readonly emitter: Emittery<Events>

  /** flag for if user is currently signed in with valid token - null when initialising */
  readonly isSignedIn: boolean | null
}
