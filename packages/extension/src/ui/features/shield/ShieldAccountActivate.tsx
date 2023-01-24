import { P3 } from "@argent/ui"
import { FC } from "react"

import { ShieldHeader } from "./ShieldHeader"

export const ShieldAccountActivate: FC = () => {
  return (
    <>
      <ShieldHeader
        title={"Activate Argent Shield"}
        subtitle={"By doing this you’ll protect your account with Argent:"}
      />
      <P3 as="ul" pl={3}>
        <li>
          It protects your account by requiring a 2nd factor (using your email
          account).
        </li>
        <li>It is needed only once per device, and every 30days.</li>
        <li>You can deactivate Argent Shield anytime.</li>
        <li>
          Keep in mind that you can not use an account protected by Argent
          Shield with other wallets.
        </li>
      </P3>
    </>
  )
}
