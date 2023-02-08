import { FC } from "react"

import { ShieldExternalLinkButton } from "./ShieldExternalLinkButton"

export const ShieldLearnMoreButton: FC = () => {
  return (
    <ShieldExternalLinkButton href={"https://www.argent.xyz/argent-x/"}>
      Learn more about Argent Shield
    </ShieldExternalLinkButton>
  )
}
