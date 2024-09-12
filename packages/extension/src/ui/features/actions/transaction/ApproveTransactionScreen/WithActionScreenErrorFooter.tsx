import { FC, PropsWithChildren } from "react"
import { ActionScreenErrorFooter } from "@argent/x-ui"

import { useActionScreen } from "../../hooks/useActionScreen"
import { isLedgerError, usePrettyError } from "../../hooks/usePrettyError"

interface WithActionScreenErrorFooterProps extends PropsWithChildren {
  isTransaction?: boolean
  customError?: string
}

export const WithActionScreenErrorFooter: FC<
  WithActionScreenErrorFooterProps
> = ({ children, isTransaction, customError }) => {
  const { action } = useActionScreen()
  const error = customError ?? action?.meta.errorApproving
  const { errorMessage, title } = usePrettyError(error, isTransaction)

  // don't show error footer if there is no error or if it's a ledger error
  if (!errorMessage || isLedgerError(errorMessage)) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <ActionScreenErrorFooter
        data-testid="tx-error"
        title={title}
        errorMessage={errorMessage}
      />
    </>
  )
}
