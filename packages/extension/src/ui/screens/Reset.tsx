import { FC } from "react"

import { P } from "../components/Typography"
import { ConfirmPageProps, ConfirmScreen } from "./Confirm"

export const ResetScreen: FC<ConfirmPageProps> = (props) => (
  <ConfirmScreen
    title="Reset wallet"
    confirmButtonText="RESET"
    confirmButtonBgColor="#fe4d4d"
    rejectButtonText="Cancel"
    {...props}
  >
    <P>
      If you forgot your password, your only option for recovery is to reset the
      extension and load your prior downloaded backup.
    </P>
    <P style={{ marginTop: 32 }}>
      The backup downloads automatically each time you add an account to your
      wallet.
    </P>
  </ConfirmScreen>
)
