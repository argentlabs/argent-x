import { H6, L2, P3, P4, icons } from "@argent/ui"
import { Center, Circle, Flex, List, ListItem } from "@chakra-ui/react"
import { FC } from "react"

import {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { ConfirmScreen } from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConnectDappAccountSelect } from "./ConnectDappAccountSelect"
import { DappIcon } from "./DappIcon"
import { useDappDisplayAttributes } from "./useDappDisplayAttributes"

const { LinkIcon } = icons

interface ConnectDappScreenProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  onReject?: () => void
  host: string
  accounts: WalletAccount[]
  selectedAccount?: BaseWalletAccount
  onSelectedAccountChange: (account: BaseWalletAccount) => void
}

export const ConnectDappScreen: FC<ConnectDappScreenProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  onReject,
  host,
  accounts,
  selectedAccount,
  onSelectedAccountChange,
}) => {
  const dappDisplayAttributes = useDappDisplayAttributes(host)
  return (
    <ConfirmScreen
      confirmButtonText={isConnected ? "Continue" : "Connect"}
      rejectButtonText={isConnected ? "Disconnect" : "Reject"}
      onSubmit={onConnect}
      onReject={isConnected ? onDisconnect : onReject}
    >
      <Center flexDirection={"column"} textAlign={"center"} gap={1}>
        <Circle size={16}>
          <DappIcon host={host} />
        </Circle>
        <H6 mt={4}>Connect to {dappDisplayAttributes?.title}</H6>
        <P4 color={"neutrals.300"}>{host}</P4>
      </Center>
      <Flex my={4} borderTop={"1px solid"} borderTopColor={"neutrals.600"} />
      <P4>Select the account to connect:</P4>
      <Flex mt={4} w={"full"} flexDirection={"column"}>
        <ConnectDappAccountSelect
          accounts={accounts}
          selectedAccount={selectedAccount}
          onSelectedAccountChange={onSelectedAccountChange}
          host={host}
        />
        {isConnected && (
          <Flex gap={1} color={"info.300"} alignItems={"center"} mt={2}>
            <L2>
              <LinkIcon transform={"rotate(-45deg)"} display={"inline-block"} />{" "}
              This account is already connected
            </L2>
          </Flex>
        )}
      </Flex>
      <Flex my={4} borderTop={"1px solid"} borderTopColor={"neutrals.600"} />
      <P4>This dapp will be able to:</P4>
      <P3 as={List} stylePosition={"inside"} listStyleType={"disc"} mt={2}>
        <ListItem>Read your wallet address</ListItem>
        <ListItem>Request transactions</ListItem>
        <P4 as={"span"} ml={5} color={"neutrals.300"}>
          You will still need to sign any new transaction
        </P4>
      </P3>
    </ConfirmScreen>
  )
}
