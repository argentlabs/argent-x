import { H5, H6, KnownDappButton, L2, P4, icons } from "@argent/ui"
import {
  Box,
  Center,
  Flex,
  List,
  ListIcon,
  ListItem,
  Text,
} from "@chakra-ui/react"
import { FC, ReactNode } from "react"

import {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { ConfirmScreen } from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConnectDappAccountSelect } from "./ConnectDappAccountSelect"
import { DappIcon } from "./DappIcon"
import { DappDisplayAttributes } from "./useDappDisplayAttributes"

const { LinkIcon, TickIcon } = icons

export interface ConnectDappScreenProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  onReject?: () => void

  host: string
  accounts: WalletAccount[]
  selectedAccount?: BaseWalletAccount
  onSelectedAccountChange: (account: BaseWalletAccount) => void
  actionIsApproving?: boolean
  footer?: ReactNode
  dappDisplayAttributes?: DappDisplayAttributes
  navigationBar?: ReactNode
}

export const ConnectDappScreen: FC<ConnectDappScreenProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  onReject,
  host,
  accounts,
  dappDisplayAttributes,
  selectedAccount,
  onSelectedAccountChange,
  actionIsApproving,
  navigationBar,
  footer,
}) => {
  const confirmButtonText = isConnected ? "Continue" : "Connect"
  const rejectButtonText = isConnected ? "Disconnect" : "Reject"

  const hostName = new URL(host).hostname

  return (
    <>
      <ConfirmScreen
        confirmButtonText={confirmButtonText}
        rejectButtonText={rejectButtonText}
        onSubmit={onConnect}
        onReject={isConnected ? onDisconnect : onReject}
        confirmButtonIsLoading={actionIsApproving}
        confirmButtonLoadingText={confirmButtonText}
        navigationBar={navigationBar}
        footer={footer}
      >
        <Center flexDirection={"column"} textAlign={"center"} gap={1}>
          <DappIcon dappDisplayAttributes={dappDisplayAttributes} />
          <H5 mt={4}>Connect to {dappDisplayAttributes?.title ?? "dapp"}</H5>
          <Flex gap="1" align="flex-end">
            <P4 fontWeight="bold" color={"neutrals.300"}>
              {hostName}
            </P4>
            {dappDisplayAttributes?.isKnown && (
              <KnownDappButton
                dapplandUrl={dappDisplayAttributes.dapplandUrl}
              />
            )}
          </Flex>
        </Center>
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
                <LinkIcon
                  transform={"rotate(-45deg)"}
                  display={"inline-block"}
                />
                This account is already connected
              </L2>
            </Flex>
          )}
        </Flex>
        <Flex my={6} borderTop={"1px solid"} borderTopColor={"neutrals.800"} />
        <H6 color="neutrals.400">This dapp will be able to:</H6>
        <Box
          border="1px solid"
          borderColor="neutrals.700"
          borderRadius="xl"
          gap="2"
          mt={3}
          p={4}
        >
          <List spacing={2}>
            <ListItem display="flex" alignItems="center">
              <ListIcon
                as={TickIcon}
                color="green.500"
                marginInlineEnd="3"
                fontSize="16"
              />
              <P4>Read your wallet address</P4>
            </ListItem>

            <ListItem display="flex" alignItems="center">
              <ListIcon
                as={TickIcon}
                color="green.500"
                marginInlineEnd="3"
                fontSize="16"
              />
              <P4>Request transactions</P4>
            </ListItem>
          </List>

          <Text ml={7} lineHeight="4" mt="1" color={"neutrals.300"}>
            You will still need to sign any new transaction
          </Text>
        </Box>
      </ConfirmScreen>
    </>
  )
}
