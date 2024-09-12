import { z } from "zod"
import { AX_LEDGER_ERROR_MESSAGES } from "../../../../shared/errors/ledger"

const exceptionMappings = [
  {
    original: "63: An unexpected error occurred",
    replacement:
      "Starknet is currently experiencing high traffic. Please try again in a few minutes.",
    title: "Tx not executed: high traffic",
  },
]

export const ledgerErrorMessageSchema = z.string().refine((err) => {
  if (err?.includes("LedgerError:")) {
    return true
  }
  const axledgerErrors = Object.values(AX_LEDGER_ERROR_MESSAGES)
  return axledgerErrors.includes(err as AX_LEDGER_ERROR_MESSAGES)
})

export function isLedgerError(errorMessage?: unknown) {
  return ledgerErrorMessageSchema.safeParse(errorMessage).success
}

const transactionErrorMessageSchema = z
  .string()
  .transform((message) => {
    const foundException = exceptionMappings.find((exception) =>
      message.includes(exception.original),
    )
    return foundException ? foundException.replacement : message
  })
  .optional()

export const usePrettyError = (message?: string, isTransaction?: boolean) => {
  const defaultTitle = isTransaction ? "Transaction failed" : "Action failed"

  const foundException = exceptionMappings.find((exception) =>
    message?.includes(exception.original),
  )
  const title = foundException ? foundException.title : defaultTitle
  const errorMessage = transactionErrorMessageSchema.parse(message)

  return { title, errorMessage }
}
