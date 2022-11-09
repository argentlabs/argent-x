import { Button, FieldError, H2, icons } from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AddressCopyButton } from "../../components/AddressCopyButton"
import { AccountStatus } from "../accounts/accounts.service"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import { useTokensWithBalance } from "./tokens.state"

const { DeployIcon } = icons

interface AccountSubheaderProps {
  status: AccountStatus
  account: BaseWalletAccount
  accountName?: string
  onRedeploy: () => void
}

export const AccountSubHeader: FC<AccountSubheaderProps> = ({
  status,
  account,
  accountName,
  onRedeploy,
}) => {
  const { tokenDetails } = useTokensWithBalance(account)
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  const accountAddress = account.address

  return (
    <Center flexDirection={"column"} gap={0.5} py={6}>
      {sumCurrencyValue !== undefined ? (
        <H2>{prettifyCurrencyValue(sumCurrencyValue)}</H2>
      ) : (
        <H2>{accountName}</H2>
      )}
      <AddressCopyButton address={accountAddress} />
      {status.code === "ERROR" && (
        <Center flexDirection={"column"} gap={2} pt={2}>
          <FieldError>{status.text}</FieldError>
          <Button size="2xs" onClick={onRedeploy} leftIcon={<DeployIcon />}>
            Redeploy
          </Button>
        </Center>
      )}
    </Center>
  )
}
