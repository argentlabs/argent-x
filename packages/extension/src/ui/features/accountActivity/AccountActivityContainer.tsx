import { H3 } from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import type { FC } from "react"

import { ActivityHistoryContainer } from "./ActivityHistoryContainer"
import { MultisigAccountActivityContainer } from "./MultisigAccountActivityContainer"
import type { WalletAccount } from "../../../shared/wallet.model"

export interface AccountActivityContainerProps {
  account: WalletAccount
}

export const AccountActivityContainer: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  const header = (
    <Center px={4} pt={2} pb={6}>
      <H3>Activity</H3>
    </Center>
  )
  if (account.type === "multisig") {
    return <MultisigAccountActivityContainer account={account} />
  }
  return <ActivityHistoryContainer account={account} header={header} />
}
