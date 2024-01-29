import { Button, CopyTooltip } from "@argent/ui"
import { FC } from "react"

import { useNavigate } from "react-router-dom"
import { routes } from "../routes"
import { useView } from "../views/implementation/react"
import { hasSavedRecoverySeedPhraseView } from "../views/account"
import { normalizeAddress, formatTruncatedAddress } from "@argent/shared"

export interface AddressCopyButtonProps {
  address: string
}

export const AddressCopyButton: FC<AddressCopyButtonProps> = ({ address }) => {
  const copyValue = normalizeAddress(address)
  const navigate = useNavigate()
  const hasSavedRecoverySeedPhrase = useView(hasSavedRecoverySeedPhraseView)
  const onClick = hasSavedRecoverySeedPhrase
    ? undefined
    : () => navigate(routes.beforeYouContinue())

  return (
    <CopyTooltip
      prompt="Click to copy address"
      copyValue={copyValue}
      onClick={onClick}
    >
      <Button
        size="3xs"
        color={"white50"}
        bg={"transparent"}
        _hover={{ bg: "neutrals.700", color: "text.primary" }}
      >
        {formatTruncatedAddress(address)}
      </Button>
    </CopyTooltip>
  )
}
