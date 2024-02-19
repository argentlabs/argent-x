import { z } from "zod"

const exceptionMappings = [
  {
    original: "63: An unexpected error occurred",
    replacement:
      "Starknet is currently experiencing high traffic. Please try again in a few minutes.",
    title: "Tx not executed: high traffic",
  },
]

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
