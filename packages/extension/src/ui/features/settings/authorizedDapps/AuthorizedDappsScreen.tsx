import type { BackendSession } from "@argent/x-shared"
import { LinkPrimaryIcon } from "@argent/x-ui/icons"
import {
  BackendSessionRow,
  BarBackButton,
  CellStack,
  Empty,
  H4,
  ModalDialog,
  NavigationContainer,
  P2,
  SegmentedButtons,
} from "@argent/x-ui"
import { useMemo, useState, type FC, type ReactEventHandler } from "react"

import { Button, Flex, useDisclosure } from "@chakra-ui/react"
import type { PreAuthorization } from "../../../../shared/preAuthorization/schema"
import { useTabIndexWithHash } from "../../../hooks/useTabIndexWithHash"
import { DappConnectionRow } from "../ui/DappConnectionRow"

interface AuthorizedDappsScreenProps {
  onBack: ReactEventHandler
  networkId: string
  accountName: string
  preAuthorizations: PreAuthorization[]
  onRemoveAll: ReactEventHandler
  onDisconnectDapp: (preAuthorization: PreAuthorization) => void
  activeSessions?: BackendSession[]
  onRevokeSession: (session: BackendSession) => void
  isSignedIn: boolean
  isSmartAccount: boolean
}

export const AuthorizedDappsScreen: FC<AuthorizedDappsScreenProps> = ({
  onBack,
  accountName,
  preAuthorizations = [],
  onDisconnectDapp,
  activeSessions = [],
  onRevokeSession,
  networkId,
  isSignedIn,
  isSmartAccount,
}) => {
  const [tabIndex, setTabIndex] = useTabIndexWithHash([
    "connected-dapps",
    "active-sessions",
  ])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [sessionToRevoke, setSessionToRevoke] = useState<BackendSession | null>(
    null,
  )

  const hasPreAuthorizations = preAuthorizations.length > 0
  const hasActiveSessions = activeSessions.length > 0
  const hasContent = hasPreAuthorizations || hasActiveSessions

  const connectedDappsContent = useMemo(() => {
    if (!hasPreAuthorizations) {
      return <Empty icon={<LinkPrimaryIcon />} title={"No connected dapps"} />
    }
    return (
      <CellStack width={"full"}>
        {preAuthorizations.map((preAuthorization) => (
          <DappConnectionRow
            key={preAuthorization.host}
            host={preAuthorization.host}
            onDisconnect={() => void onDisconnectDapp(preAuthorization)}
            networkId={networkId}
          />
        ))}
      </CellStack>
    )
  }, [hasPreAuthorizations, preAuthorizations, networkId, onDisconnectDapp])

  const activeSessionsContent = useMemo(() => {
    if (!hasActiveSessions) {
      return (
        <Empty
          icon={<LinkPrimaryIcon />}
          title={
            isSignedIn
              ? "No active sessions"
              : "Sign in to manage active sessions"
          }
        />
      )
    }
    return (
      <>
        <CellStack width={"full"}>
          {activeSessions.map((session) => (
            <BackendSessionRow
              key={session.sessionKey}
              session={session}
              onRevoke={() => {
                setSessionToRevoke(session)
                onOpen()
              }}
              networkId={networkId}
            />
          ))}
        </CellStack>
        <ModalDialog
          isOpen={isOpen}
          onClose={onClose}
          showCloseButton={false}
          maxWidth="280px"
        >
          <H4 textAlign="center">Revoke session</H4>
          <P2 textAlign="center">
            Are you sure you want to revoke this session?
          </P2>
          <Flex flexDirection="column" gap="2" p="0" w="full">
            <Button
              onClick={() => {
                if (sessionToRevoke) {
                  void onRevokeSession(sessionToRevoke)
                }
                onClose()
              }}
              colorScheme="primary"
              w="full"
              size="medium"
              _focusVisible={{
                outline: "none",
              }}
            >
              Revoke session
            </Button>
            <Button
              onClick={onClose}
              colorScheme="secondary"
              w="full"
              size="medium"
            >
              Cancel
            </Button>
          </Flex>
        </ModalDialog>
      </>
    )
  }, [
    hasActiveSessions,
    activeSessions,
    isOpen,
    onClose,
    isSignedIn,
    networkId,
    onOpen,
    sessionToRevoke,
    onRevokeSession,
  ])

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={accountName ?? "Authorized dapps"}
    >
      {hasContent ? (
        <>
          {isSmartAccount && (
            <SegmentedButtons
              options={["Connected dapps", "Active sessions"]}
              defaultSelectedIndex={tabIndex}
              onSelectionChange={setTabIndex}
              mx="4"
              mt="2"
            />
          )}
          {tabIndex === 0 && connectedDappsContent}
          {tabIndex === 1 && activeSessionsContent}
        </>
      ) : (
        <Empty
          icon={<LinkPrimaryIcon />}
          title={
            !isSmartAccount || isSignedIn
              ? "No authorized dapps"
              : "Sign in to manage authorized dapps"
          }
        />
      )}
    </NavigationContainer>
  )
}
