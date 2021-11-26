import { getL1 } from "./keys/l1"

let sessionPassword: string | undefined
let sessionTimeout: number | undefined

export function startSession(
  password: string,
  duration: number = 15 * 60 * 60 * 1000,
  onCloseCallback: () => void = () => {},
) {
  sessionPassword = password
  sessionTimeout = setTimeout(() => {
    stopSession()
    onCloseCallback()
  }, duration) as unknown as number
  return getL1(password)
}

export function stopSession() {
  sessionPassword = undefined
  if (sessionTimeout) clearTimeout(sessionTimeout)
}

export function hasActiveSession() {
  return Boolean(sessionPassword)
}

export function getSession() {
  return sessionPassword
}
