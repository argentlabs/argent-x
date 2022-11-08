import retry from "async-retry"

import { isEnsFree, requestEmailVerification, reserveEns } from "./account"
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

  return requestEmailVerification(email)
}
