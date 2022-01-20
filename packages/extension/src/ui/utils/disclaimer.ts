export const understandDisclaimer = () => {
  localStorage.setItem("UNDERSTOOD_DISCLAIMER", JSON.stringify(true))
}

export const showDisclaimer = () => {
  try {
    const understoodDisclaimer = JSON.parse(
      localStorage.getItem("UNDERSTOOD_DISCLAIMER") || "false",
    )
    return !understoodDisclaimer
  } catch {
    return true
  }
}
