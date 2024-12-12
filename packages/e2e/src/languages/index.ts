import path from "node:path"

import type { ILanguage } from "./ILanguage"

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const lang: ILanguage = require(
  path.join(__dirname, `${process.env.LANGUAGE ?? "en"}`),
).default
