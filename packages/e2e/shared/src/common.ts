export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const expireBESession = async (
  email: string,
  app: "webwallet" | "argentx",
) => {
  const requestOptions = {
    method: "GET",
  }
  const request = `${
    process.env.ARGENT_API_BASE_URL
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
