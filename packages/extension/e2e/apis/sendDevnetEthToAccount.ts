import { BASE_URL } from "./account"

export async function mintDevnetEthToAccount(address: string) {
  await fetch(BASE_URL + "mint", {
    method: "POST",
    body: JSON.stringify({
      address,
      amount: 1e18,
      lite: true,
    }),
  })
}
