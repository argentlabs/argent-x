import { H6, L2, P4, iconsDeprecated } from "@argent/x-ui"
import { Box, Flex, List, ListIcon, ListItem, Text } from "@chakra-ui/react"
import { FC, PropsWithChildren, ReactNode } from "react"

import {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { ConfirmScreen } from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConnectDappAccountSelect } from "./ConnectDappAccountSelect"
import { DappDisplayAttributes } from "./useDappDisplayAttributes"
import { DappActionHeader } from "./DappActionHeader"
import { getDefaultSortedAccounts } from "../../accounts/getDefaultSortedAccount"

const { TickIcon, LinkIcon } = iconsDeprecated

export interface ConnectDappScreenProps extends PropsWithChildren {
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
  isHighRisk: boolean
  hasAcceptedRisk: boolean
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
  children,
  isHighRisk,
  hasAcceptedRisk,
}) => {
  const confirmButtonText = isConnected ? "Continue" : "Connect"
  const rejectButtonText = isConnected ? "Disconnect" : "Cancel"

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
        destructive={isHighRisk}
        confirmButtonDisabled={isHighRisk && !hasAcceptedRisk}
      >
        <DappActionHeader
          host={host}
          dappDisplayAttributes={dappDisplayAttributes}
          title={`Connect to ${dappDisplayAttributes?.title ?? "dapp"}`}
          mb={3}
        />
        {children}
        <Flex mt={4} w={"full"} flexDirection={"column"}>
          <ConnectDappAccountSelect
            accounts={getDefaultSortedAccounts(accounts)}
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
