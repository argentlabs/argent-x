import retry from "async-retry"

import { isEnsFree, reserveEns } from "./backend/account"

// generate random names like "ax-n12dwvzfyw.argent.xyz"
export const generateArgentName = (length: number = 10) => {
  const randomString = Math.random()
    .toString(36)
    .substring(2, length + 2)
  return `ax-${randomString}.argent.xyz`
}

export async function assignEns() {
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

  return reservedEns
}
