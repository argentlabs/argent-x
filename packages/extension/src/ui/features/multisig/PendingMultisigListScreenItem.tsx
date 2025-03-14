import {
  ChevronRightSecondaryIcon,
  MoreSecondaryIcon,
} from "@argent/x-ui/icons"
import { Button } from "@argent/x-ui"
import { Circle, Flex } from "@chakra-ui/react"
import type { FC, MouseEvent } from "react"
import { useCallback, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"

import type { PendingMultisig } from "../../../shared/multisig/types"
import { routes } from "../../../shared/ui/routes"
import { AccountListScreenItemAccessory } from "../accounts/AccountListScreenItemAccessory"
import { PendingMultisigListItem } from "./PendingMultisigListItem"
import { getAccountIdentifier } from "../../../shared/utils/accountIdentifier"

/** TODO: refactor - this should use AccoutListScreenItem */

export interface IPendingMultisigListScreenItem {
  pendingMultisig: PendingMultisig
  clickNavigateSettings?: boolean
}

export const PendingMultisigListScreenItem: FC<
  IPendingMultisigListScreenItem
> = ({ pendingMultisig, clickNavigateSettings }) => {
  const navigate = useNavigate()
  const mouseDownSettings = useRef(false)

  const onClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (clickNavigateSettings || mouseDownSettings.current) {
        navigate(routes.multisigJoinSettings(pendingMultisig.publicKey))
      } else {
        navigate(routes.multisigJoin(pendingMultisig.publicKey))
      }
    },
    [clickNavigateSettings, navigate, pendingMultisig.publicKey],
  )

  const accountId = useMemo(
    () =>
      getAccountIdentifier(
        pendingMultisig.publicKey,
        pendingMultisig.networkId,
        pendingMultisig.signer,
      ),
    [pendingMultisig],
  )

  // TODO: Implement onOptionsClick

  return (
    <Flex position="relative" direction="column" w="full">
      <PendingMultisigListItem
        aria-label={`Select ${pendingMultisig.name}`}
        onMouseDown={(e) => {
          e.stopPropagation()
          mouseDownSettings.current = false
        }}
        onClick={onClick}
        accountName={pendingMultisig.name}
        accountId={accountId}
        publicKey={pendingMultisig.publicKey}
        networkId={pendingMultisig.networkId}
        isLedger={pendingMultisig.signer.type === "ledger"}
        pr={14}
      >
        {clickNavigateSettings && (
          <AccountListScreenItemAccessory>
            <ChevronRightSecondaryIcon opacity={0.6} />
          </AccountListScreenItemAccessory>
        )}
        {!clickNavigateSettings && (
          <AccountListScreenItemAccessory>
            <Button
              aria-label={`${pendingMultisig.name} options`}
              onMouseDown={(e) => {
                e.stopPropagation()
                mouseDownSettings.current = true
              }}
              onClick={onClick}
              as={Circle}
              colorScheme="transparent"
              width={8}
              height={8}
              size="auto"
              rounded="full"
              bg="black"
              _hover={{
                bg: "neutrals.600",
              }}
            >
              <MoreSecondaryIcon />
            </Button>
          </AccountListScreenItemAccessory>
        )}
      </PendingMultisigListItem>
    </Flex>
  )
}
