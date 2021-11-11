import { FC } from "react"

import { P } from "../components/Typography"
import { Confirm, ConfirmPageProps } from "./Confirm"

export const ResetScreen: FC<ConfirmPageProps> = (props) => {
  return (
    <Confirm
      title="Reset wallet"
      confirmButtonText="RESET"
      confirmButtonBgColor="#fe4d4d"
      rejectButtonText="Cancel"
      {...props}
    >
      <P>
        If you forgot your password, your only option for revocery is to reset
        the extension and load your prior downloaded Backup.
      </P>
      <P style={{ marginTop: 32 }}>
        The Backup downloads automatically each time you add an account to your
        wallet.
      </P>
    </Confirm>
  )
}
