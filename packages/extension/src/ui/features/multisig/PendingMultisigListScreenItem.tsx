import { Button, icons } from "@argent/ui"
import { Circle, Flex } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import { PendingMultisig } from "../../../shared/multisig/types"
import { pendingMultisigToMultisig } from "../../../shared/multisig/utils/pendingMultisig"
import { routes } from "../../routes"
import { AccountItemIconContainer } from "../accounts/AccountListScreenItem"
import { useMultisigDataForSigner } from "./hooks/useMultisigDataForSigner"
import { PendingMultisigListItem } from "./PendingMultisigListItem"

const { ChevronRightIcon, MoreIcon } = icons

export interface IPendingMultisigListScreenItem {
  pendingMultisig: PendingMultisig
  clickNavigateSettings?: boolean
}

export const PendingMultisigListScreenItem: FC<
  IPendingMultisigListScreenItem
> = ({ pendingMultisig, clickNavigateSettings }) => {
  const navigate = useNavigate()
  const mouseDownSettings = useRef(false)

  const { data: multisigData } = useMultisigDataForSigner(pendingMultisig)

  useEffect(() => {
    if (multisigData) {
      pendingMultisigToMultisig(pendingMultisig, multisigData)
    }
  }, [multisigData, pendingMultisig])

  const onClick = useCallback(() => {
    navigate(routes.multisigJoin(pendingMultisig.publicKey))
  }, [navigate, pendingMultisig.publicKey])

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
        publicKey={pendingMultisig.publicKey}
        networkId={pendingMultisig.networkId}
        pr={14}
      >
        {clickNavigateSettings && (
          <AccountItemIconContainer>
            <ChevronRightIcon opacity={0.6} />
          </AccountItemIconContainer>
        )}
        {!clickNavigateSettings && (
          <AccountItemIconContainer>
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
              <MoreIcon />
            </Button>
          </AccountItemIconContainer>
        )}
      </PendingMultisigListItem>
    </Flex>
  )
}
