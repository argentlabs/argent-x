import { z } from "zod"
import { create } from "zustand"
import { splitPhrase } from "./phraseUtils"
import { validateMnemonic } from "@scure/bip39"
import { wordlist } from "@scure/bip39/wordlists/english"

interface State {
  seedPhrase?: string
  password?: string
}

export const useSeedRecovery = create<State>()(() => ({}))

export const validateSeedPhrase = (seedPhrase: string): boolean => {
  const words = splitPhrase(seedPhrase.trim())
  // check seed phrase has correct number of words
  if (words.length !== 12) {
    return false
  }

  const isValid = validateMnemonic(seedPhrase.trim(), wordlist)

  return isValid
}

export const passwordSchema = z
  .string()
  .min(5, "Password must be at least 5 characters")

export const validatePassword = (password: string): boolean => {
  const { success } = passwordSchema.safeParse(password)
  return success
}

export const validateAndSetSeedPhrase = (seedPhrase: string): void => {
  if (!validateSeedPhrase(seedPhrase)) {
    throw new Error("Invalid seed phrase")
  }
  return useSeedRecovery.setState({ seedPhrase })
}

export const validateAndSetPassword = (password: string): void => {
  if (!validatePassword(password)) {
    throw new Error("Invalid password")
  }
  return useSeedRecovery.setState({ password })
}

export const validateSeedRecoveryCompletion = (
  state: State,
): state is Required<State> =>
  Boolean(
    state.seedPhrase &&
      state.password &&
      validateSeedPhrase(state.seedPhrase) &&
      validatePassword(state.password),
  )
