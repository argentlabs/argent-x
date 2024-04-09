import { SeedPhrase } from "@argent-x/extension/src/ui/features/recovery/SeedPhrase"
import { generateMnemonic } from "@scure/bip39"
import { wordlist as en } from "@scure/bip39/wordlists/english"

import { decorators } from "../../decorators/routerDecorators"

const seedPhrase = generateMnemonic(en)

export default {
  component: SeedPhrase,
  decorators,
}

export const Loading = {
  args: {},
}

export const Populated = {
  args: {
    seedPhrase,
  },
}

export const LongText = {
  args: {
    seedPhrase:
      "foo bar baz foofoo barbarbar bazbazbazbazbaz foo bar baz foofoo bar baz",
  },
}
