import { z } from "zod"

export const ledgerStartContextSchema = z.enum(["create", "join", "restore"])

export type LedgerStartContext = z.infer<typeof ledgerStartContextSchema>
