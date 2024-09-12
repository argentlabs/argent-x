import { FC } from "react"
import {
  SmartAccountExternalLinkButton,
  ARGENT_GUARDIAN_LINK,
} from "./SmartAccountExternalLinkButton"

export const SmartAccountLearnMoreButton: FC = () => {
  return (
    <SmartAccountExternalLinkButton href={ARGENT_GUARDIAN_LINK}>
      Learn more about Argent Smart Account
    </SmartAccountExternalLinkButton>
  )
}
