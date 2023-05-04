import { Button, FieldError, H2, icons } from "@argent/ui"
import { VStack } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AddressCopyButton } from "../../components/AddressCopyButton"
import { useStarknetId } from "../../services/useStarknetId"
import { AccountStatus } from "../accounts/accounts.service"
import { StarknetIdCopyButton } from "./StarknetIdCopyButton"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import { useTokensWithBalance } from "./tokens.state"

const { DeployIcon } = icons

interface AccountSubheaderProps {
  status: AccountStatus
  account: BaseWalletAccount
  accountName?: string
  onRedeploy: () => void
}

export const AccountTokensHeader: FC<AccountSubheaderProps> = ({
  status,
  account,
  accountName,
  onRedeploy,
}) => {
  const { tokenDetails } = useTokensWithBalance(account)
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  const accountAddress = account.address

  const { data: starknetId } = useStarknetId(account)

  return (
    <VStack spacing={0.5}>
      {sumCurrencyValue !== undefined ? (
        <H2>{prettifyCurrencyValue(sumCurrencyValue)}</H2>
      ) : (
        <H2>{accountName}</H2>
      )}
      {starknetId ? (
        <StarknetIdCopyButton
          starknetId={starknetId}
          address={accountAddress}
        />
      ) : (
        <AddressCopyButton address={accountAddress} />
      )}
      {status.code === "ERROR" && (
        <VStack spacing={2} pt={2}>
          <FieldError>{status.text}</FieldError>
          <Button size="2xs" onClick={onRedeploy} leftIcon={<DeployIcon />}>
            Redeploy
          </Button>
        </VStack>
      )}
    </VStack>
  )
}
