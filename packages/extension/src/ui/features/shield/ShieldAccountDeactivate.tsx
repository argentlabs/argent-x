import { FC } from "react"

import { ShieldHeader } from "./ShieldHeader"

export const ShieldAccountDeactivate: FC = () => {
  return (
    <>
      <ShieldHeader
        title={"Deactivate Argent Shield"}
        subtitle={
          "You will remove the additional 2FA protection on your acccount."
        }
      />
    </>
  )
}
