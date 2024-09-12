import { H4 } from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import { FC } from "react"

import { ActivityHistoryContainer } from "./ActivityHistoryContainer"
import { MultisigAccountActivityContainer } from "./MultisigAccountActivityContainer"
import { WalletAccount } from "../../../shared/wallet.model"

export const header = (
  <Center px={4} pt={2} pb={6}>
    <H4>Activity</H4>
  </Center>
)

export interface AccountActivityContainerV2Props {
  account: WalletAccount
}

export const AccountActivityContainerV2: FC<
  AccountActivityContainerV2Props
> = ({ account }) => {
  if (account.type === "multisig") {
    return <MultisigAccountActivityContainer account={account} />
  }
  return <ActivityHistoryContainer account={account} header={header} />
}
