import { FC, PropsWithChildren } from "react"

import { useActionScreen } from "../../hooks/useActionScreen"
import { usePrettyError } from "../../hooks/usePrettyError"
import { ActionScreenErrorFooter } from "./ActionScreenErrorFooter"

interface WithActionScreenErrorFooterProps extends PropsWithChildren {
  isTransaction?: boolean
}

export const WithActionScreenErrorFooter: FC<
  WithActionScreenErrorFooterProps
> = ({ children, isTransaction }) => {
  const { action } = useActionScreen()
  const { errorMessage, title } = usePrettyError(
    action?.meta.errorApproving,
    isTransaction,
  )
  if (!errorMessage) {
    return <>{children}</>
  }
  return (
    <>
      {children}
      <ActionScreenErrorFooter title={title} errorMessage={errorMessage} />
    </>
  )
}
