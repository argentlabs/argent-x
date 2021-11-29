import { getL1 } from "./keys/l1"

let sessionPassword: string | undefined
let sessionStartTime: number | undefined
let sessionTimeoutDelay: number | undefined
let sessionTimeout: number | undefined

export function startSession(
  password: string,
  duration: number = 15 * 60 * 60 * 1000,
  onCloseCallback: () => void = () => {},
) {
  sessionPassword = password
  sessionStartTime = Date.now()
  sessionTimeoutDelay = duration
  sessionTimeout = setTimeout(() => {
    stopSession()
    onCloseCallback()
  }, duration) as unknown as number
  return getL1(password)
}

export function stopSession() {
  sessionPassword = undefined
  sessionStartTime = undefined
  if (sessionTimeout) clearTimeout(sessionTimeout)
}

export function hasActiveSession() {
  if (
    sessionStartTime &&
    sessionTimeoutDelay &&
    sessionStartTime - sessionTimeoutDelay > Date.now()
  )
    return false
  return Boolean(sessionPassword)
}

export function getSession() {
  if (!hasActiveSession()) return undefined
  return sessionPassword
}
