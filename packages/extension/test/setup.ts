import fetch from "cross-fetch"

try {
  global.fetch = fetch
} catch {
  // do nothing
}
try {
  window.fetch = fetch
} catch {
  // do nothing
}
