import retry from "async-retry"

import {
  isEnsFree,
  requestEmailAuthentication,
  reserveEns,
  verifyEmail,
} from "./account"
import { generateArgentName } from "./genArgentName"

export const requestEmail = async (email: string) => {
  const reservedEns = await retry(async (bail) => {
    const tryEns = generateArgentName()
    const checkResult = await isEnsFree(tryEns).catch(
      (e) => bail(e), // if network error, dont retry
    )
    if (checkResult !== "toBeReserved") {
      if (checkResult === undefined) {
        return
      }
      throw new Error("ENS already taken")
    }
    const reserveResult = await reserveEns(tryEns).catch(
      (e) => bail(e), // if network error, dont retry
    )
    if (reserveResult !== "toBeReserved") {
      if (checkResult === undefined) {
        return
      }
      throw new Error("failed to reserve ENS")
    }
    return tryEns
  })

  console.log("reservedEns", reservedEns)

  return requestEmailAuthentication(email)
}

export const confirmEmail = async (code: string) => {
  const status = await verifyEmail(code)
  if (status !== "verified") {
    throw new Error("failed to verify email", { cause: status })
  }
}
