import { FC } from "react"

import { ShieldHeader } from "./ui/ShieldHeader"

export const ShieldAccountNotDeployed: FC = () => {
  return (
    <ShieldHeader
      title={"Add Argent Shield"}
      subtitle={
        "You must be deploy this account before Argent Shield can be added"
      }
    />
  )
}
