import { validateMnemonic } from "@scure/bip39"
import { wordlist as en } from "@scure/bip39/wordlists/english"
import { z } from "zod"

export const seedphraseSchema = z.string().refine((value) => {
  return validateMnemonic(value, en) // we only support english for now
}, "Invalid seedphrase")
