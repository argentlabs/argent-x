import { Flex, type ButtonProps } from "@chakra-ui/react"
import { useMemo, type FC } from "react"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { useStarknetId } from "../services/useStarknetId"
import { formatTruncatedAddress, normalizeAddress } from "@argent/x-shared"
import { useNavigate } from "react-router-dom"
import { useView } from "../views/implementation/react"
import { needsToSaveRecoverySeedphraseView } from "../views/account"
import { routes } from "../../shared/ui/routes"
import { CopyPrimaryIcon } from "@argent/x-ui/icons"
import { Button, CopyTooltip } from "@argent/x-ui"

export interface StarknetIdOrAddressCopyButtonProps extends ButtonProps {
  account: BaseWalletAccount
}

export const StarknetIdOrAddressCopyButton: FC<
  StarknetIdOrAddressCopyButtonProps
> = ({ account, ...rest }) => {
  const { data: starknetId } = useStarknetId(account)
  const navigate = useNavigate()
  const needsToSaveRecoverySeedphrase = useView(
    needsToSaveRecoverySeedphraseView,
  )

  const onClick = needsToSaveRecoverySeedphrase
    ? () => navigate(routes.beforeYouContinue())
    : undefined

  const normalizedAddress = useMemo(
    () => normalizeAddress(account.address),
    [account.address],
  )

  return (
    <CopyTooltip
      prompt="Click to copy address"
      copyValue={normalizedAddress}
      onClick={onClick}
    >
      <Button
        data-testid="address-copy-button"
        data-value={account.address}
        size="3xs"
        colorScheme="white"
        bg="button-secondary"
        _hover={{ bg: "neutrals.700", color: "text-primary" }}
        gap={0}
        {...rest}
      >
        <Flex align="center" gap={1} mx={0.5}>
          {starknetId ?? formatTruncatedAddress(normalizedAddress)}
          <CopyPrimaryIcon h={3} w={3} ml={0.5} />
        </Flex>
      </Button>
    </CopyTooltip>
  )
}
