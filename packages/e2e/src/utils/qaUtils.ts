import config from "../config"

const headers = {
  "Content-Type": "application/json",
  auth: config.qaUtilsAuthToken || "",
}

export const requestFunds = async (
  account: string,
  amount: number,
  token: string = "ETH",
) => {
  const requestOptions = {
    method: "POST",
    headers,
    body: JSON.stringify({
      address: account,
      token,
      amount,
    }),
  }
  const request = `${config.qaUtilsURL}/api/fundAccount`

  const response = await fetch(request, requestOptions)
  if (response.status !== 200) {
    console.error(await response.text())
    throw new Error(`Error funding account: ${account}`)
  }
  return response.status
}

export const slackNotifyLowBalance = async () => {
  const requestOptions = {
    method: "GET",
    headers,
  }
  const request = `${config.qaUtilsURL}/api/notifyLowBalance`
  const response = await fetch(request, requestOptions)
  if (response.status !== 200) {
    console.error(await response.text())
    throw new Error(`Error notifying low balance`)
  }
  return response.status
}
