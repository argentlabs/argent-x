import { LangEn, Mnemonic } from "ethers"
import create from "zustand"

interface State {
  seedPhrase?: string
  password?: string
}

export const useSeedRecovery = create<State>(() => ({}))

export const validateSeedPhrase = (
  seedPhrase: string,
  wordlist = LangEn.wordlist(),
): boolean => {
  const words = wordlist.split(seedPhrase.trim())
  // check seed phrase has correct number of words
  if (words.length !== 12) {
    return false
  }
  // check every word is in the wordlist
  if (!words.every((word) => wordlist.getWordIndex(word) >= 0)) {
    return false
  }

  // check if seedphrase is valid with HDNode
  return Mnemonic.isValidMnemonic(seedPhrase)
}

export const validatePassword = (password: string): boolean => {
  if (password.length > 5) {
    return true
  }
  return false
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
