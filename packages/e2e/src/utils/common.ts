import config from "../config"
import { v4 as uuid } from "uuid"

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const app = "argentx"
export const expireBESession = async (email: string) => {
  const requestOptions = {
    method: "GET",
  }
  const request = `${
    config.beAPIUrl
  }/debug/expireCredentials?application=${app}&email=${encodeURIComponent(
    email,
  )}`
  const response = await fetch(request, requestOptions)
  if (response.status != 200) {
    console.error(response.body)
    throw new Error(`Error expiring session: ${request}`)
  }
  return response.status
}

export const logInfo = (message: string | object) => {
  const canLogInfo = process.env.E2E_LOG_INFO || false
  if (canLogInfo) {
    console.log(message)
  }
}

export const generateEmail = () => `e2e_2fa_${uuid()}@mail.com`
