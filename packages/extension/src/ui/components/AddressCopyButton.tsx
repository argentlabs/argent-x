import { Button, CopyTooltip } from "@argent/x-ui"
import type { FC } from "react"

import { formatTruncatedAddress, normalizeAddress } from "@argent/x-shared"
import { useNavigate } from "react-router-dom"
import { routes } from "../../shared/ui/routes"
import { needsToSaveRecoverySeedphraseView } from "../views/account"
import { useView } from "../views/implementation/react"

export interface AddressCopyButtonProps {
  address: string
}

export const AddressCopyButton: FC<AddressCopyButtonProps> = ({
  address,
  ...rest
}) => {
  const copyValue = normalizeAddress(address)
  const navigate = useNavigate()
  const needsToSaveRecoverySeedphrase = useView(
    needsToSaveRecoverySeedphraseView,
  )

  const onClick = needsToSaveRecoverySeedphrase
    ? () => navigate(routes.beforeYouContinue())
    : undefined

  return (
    <CopyTooltip
      prompt="Click to copy address"
      copyValue={copyValue}
      onClick={onClick}
    >
      <Button
        data-testid="address-copy-button"
        size="3xs"
        color={"white.50"}
        bg={"transparent"}
        _hover={{ bg: "neutrals.700", color: "text-primary" }}
        {...rest}
      >
        {formatTruncatedAddress(address)}
      </Button>
    </CopyTooltip>
  )
}
