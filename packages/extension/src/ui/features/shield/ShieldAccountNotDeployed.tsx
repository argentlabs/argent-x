import { FC } from "react"

import { ShieldHeader } from "./ShieldHeader"

export const ShieldAccountNotDeployed: FC = () => {
  return (
    <>
      <ShieldHeader
        title={"Activate Argent Shield"}
        subtitle={
          "You must be deploy this account before Argent Shield can be activated"
        }
      />
    </>
  )
}
