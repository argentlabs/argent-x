import { ethers, wordlists } from "ethers"
import create from "zustand"

interface State {
  seedPhrase?: string
  password?: string
}

export const useSeedRecover = create<State>(() => ({}))

export const validateSeedPhrase = (seedPhrase: string): boolean => {
  const words = wordlists.en.split(seedPhrase.trim())
  // check seed phrase has correct number of words
  if (words.length !== 12) {
    return false
  }
  // check every word is in the wordlist
  if (!words.every((word) => wordlists.en.getWordIndex(word) >= 0)) {
    return false
  }

  // check if seedphrase is valid with HDNode
  try {
    ethers.utils.HDNode.fromMnemonic(seedPhrase)
  } catch (e) {
    return false
  }

  return true
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
  return useSeedRecover.setState({ seedPhrase })
}

export const validateAndSetPassword = (password: string): void => {
  if (!validatePassword(password)) {
    throw new Error("Invalid password")
  }
  return useSeedRecover.setState({ password })
}

export const validateSeedRecoverStateIsComplete = (
  state: State,
): state is Required<State> => {
  return Boolean(
    state.seedPhrase &&
      state.password &&
      validateSeedPhrase(state.seedPhrase) &&
      validatePassword(state.password),
  )
}
