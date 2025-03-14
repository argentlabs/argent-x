import config from "../config"
import { v4 as uuidv4 } from "uuid"
import { logInfo } from "./common"

const DEFAULT_TIMEOUT = 35000

const createHeaders = (
  account?: string,
  token?: string,
  amount?: number | string,
) => ({
  authorization: config.qaUtilsAuthToken || "",
  reqId: account
    ? `${account}_${token}_${amount}_${uuidv4().replace(/-/g, "")}`
    : uuidv4(),
})

async function fetchWithTimeout(url: string, options: RequestInit) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    const data = await response.json()
    return { response, data }
  } catch (error) {
    console.error({
      event: "fetch_error",
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof DOMException ? error.name : "Unknown",
      url: url.split("?")[0],
    })
    throw error
  } finally {
    clearTimeout(id)
  }
}

export const requestFunds = async (
  account: string,
  amount: number | string,
  token: string = "ETH",
) => {
  const headers = createHeaders(account, token, amount)
  const url = `${config.qaUtilsURL}/api/fundAccount?address=${account}&token=${token}&amount=${amount}`

  try {
    const { response, data } = await fetchWithTimeout(url, {
      method: "GET",
      headers,
    })
    logInfo({
      event: "request_funds_success",
      reqId: headers.reqId,
      account,
      token,
      amount,
      response: data,
    })
    if (!response.ok) {
      throw new Error(
        `Error funding account: ${account}, status: ${response.status}, message: ${JSON.stringify(data)}`,
      )
    }
    return response.status
  } catch (error) {
    console.error({
      event: "request_funds_error",
      reqId: headers.reqId,
      account,
      token,
      amount,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof DOMException ? error.name : "Unknown",
    })
    throw error
  }
}

export const slackNotifyLowBalance = async () => {
  const headers = createHeaders()
  const url = `${config.qaUtilsURL}/api/notifyLowBalance`

  try {
    const { response, data } = await fetchWithTimeout(url, {
      method: "GET",
      headers,
    })
    logInfo({
      event: "notify_low_balance_success",
      reqId: headers.reqId,
      response: data,
    })
    if (!response.ok) {
      throw new Error(`Error notifying low balance: ${JSON.stringify(data)}`)
    }
    return response.status
  } catch (error) {
    console.error({
      event: "notify_low_balance_error",
      reqId: headers.reqId,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof DOMException ? error.name : "Unknown",
    })
    throw error
  }
}

export const getBalance = async (account: string, token: string = "ETH") => {
  const headers = createHeaders(account, token)
  const url = `${config.qaUtilsURL}/api/getBalance?addr=${account}&token=${token}`
  try {
    const { response, data } = await fetchWithTimeout(url, {
      method: "GET",
      headers,
    })
    logInfo({
      event: "get_balance_success",
      reqId: headers.reqId,
      account,
      token,
      response: data,
    })
    if (!response.ok) {
      throw new Error(`Error getting balance: ${JSON.stringify(data)}`)
    }
    const balance = (data?.asset?.balance as string) ?? "0.0"
    return ["0.0000", "0.000", "0.00", "0"].includes(balance) ? "0.0" : balance
  } catch (error) {
    console.error({
      event: "get_balance_error",
      reqId: headers.reqId,
      account,
      token,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof DOMException ? error.name : "Unknown",
    })
    throw error
  }
}
