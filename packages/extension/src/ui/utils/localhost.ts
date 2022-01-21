export const getLocalhostPort = () => {
  const port = parseInt(localStorage.port)
  return !port || isNaN(port) ? 5000 : port
}
