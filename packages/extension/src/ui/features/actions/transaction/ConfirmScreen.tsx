import { FormEvent } from "react"

import { Account } from "../../accounts/Account"

export interface ConfirmPageProps {
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  onReject?: () => void
  selectedAccount?: Account
}
