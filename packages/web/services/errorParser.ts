export const parseStarknetError = (error: Error): Error => {
  if (
    error.message.includes("Error message: argent: signer signature invalid")
  ) {
    return new Error("Invalid signature", { cause: error })
  }
  return error
}
