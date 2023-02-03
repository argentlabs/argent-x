import { P4, icons } from "@argent/ui"
import { FC } from "react"

import { ShieldExternalLinkButton } from "../ui/ShieldExternalLinkButton"
import { ShieldHeader } from "../ui/ShieldHeader"
import { getEscapeDisplayAttributes } from "./EscapeBanner"
import { LiveAccountEscapeProps } from "./useAccountEscape"

const { AlertIcon } = icons

interface EscapeSignerProps {
  liveAccountEscape: LiveAccountEscapeProps
}

export const EscapeSigner: FC<EscapeSignerProps> = ({ liveAccountEscape }) => {
  const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
  return (
    <>
      <ShieldHeader
        icon={AlertIcon}
        title={title}
        subtitle={"This account will be controlled by another key."}
        variant={colorScheme}
      />
      <P4 color="neutrals.400">
        If you don’t recognize this action, it’s likely that Argent Shield is
        compromised. We recommend taking the following steps:
      </P4>
      <P4 as="ol">
        <li>
          Remove Argent Shield within 5 days (you will see an ongoing message in
          Argent X)
        </li>
        <li>Wait 7 days to access your now safe-to-use account</li>
      </P4>
      <ShieldExternalLinkButton href={"https://www.argent.xyz/argent-x/"}>
        Detailed instructions
      </ShieldExternalLinkButton>
    </>
  )
}
