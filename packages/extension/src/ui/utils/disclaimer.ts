export const understandDisclaimer = () => {
  localStorage.setItem("UNDERSTOOD_DISCLAIMER", JSON.stringify(true))
}

export const isDisclaimerUnderstood = () => {
  try {
    return JSON.parse(localStorage.getItem("UNDERSTOOD_DISCLAIMER") || "false")
  } catch {
    return false
  }
}
