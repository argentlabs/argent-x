interface RequestInitWithTimeout extends RequestInit {
  timeout?: number
}

export async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInitWithTimeout = {},
): Promise<Response> {
  const { timeout = 8000, ...options } = init

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(input, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)

  return response
}
