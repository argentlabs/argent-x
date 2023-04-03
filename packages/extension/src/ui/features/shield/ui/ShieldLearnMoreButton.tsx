import { FC } from "react"

import {
  ARGENT_GUARDIAN_LINK,
  ShieldExternalLinkButton,
} from "./ShieldExternalLinkButton"

export const ShieldLearnMoreButton: FC = () => {
  return (
    <ShieldExternalLinkButton href={ARGENT_GUARDIAN_LINK}>
      Learn more about Argent Shield
    </ShieldExternalLinkButton>
  )
}
