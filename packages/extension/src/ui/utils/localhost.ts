import { number } from "starknet"

export const getLocalhostPort = () => {
  const port = parseInt(localStorage.port)
  return !port || isNaN(port) ? 5000 : port
}

export const setLocalhostPort = (port: number) => {
  localStorage.port = `${port}`
}
