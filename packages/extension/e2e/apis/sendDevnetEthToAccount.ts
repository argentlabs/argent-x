import fetch from "cross-fetch"

import { BASE_URL } from "./account"

export async function mintDevnetEthToAccount(address: string) {
  await fetch(BASE_URL + "mint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address: address.toLowerCase().replace("0x0", "0x"),
      amount: 1e18,
      lite: true,
    }),
  })
}
