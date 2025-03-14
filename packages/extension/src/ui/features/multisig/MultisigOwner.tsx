import {
  SettingsSecondaryIcon,
  EditPrimaryIcon,
  CheckmarkSecondaryIcon,
} from "@argent/x-ui/icons"
import { CopyTooltip, H5, P3 } from "@argent/x-ui"
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"

import { MultisigOwnerNameModal } from "./MultisigOwnerNameModal"
import type { FC, PropsWithChildren } from "react"
import { useMemo } from "react"
import { noop } from "lodash-es"
import { encodeBase58, formatTruncatedSignerKey } from "@argent/x-shared"
import type { SignerMetadata } from "../../../shared/multisig/types"
import { MultisigRemoveOwnerModal } from "./MultisigRemoveOwnerModal"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useOnLedgerStart } from "../ledger/hooks/useOnLedgerStart"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

interface MultisigOwnerProps {
  owner: string
  account?: WalletAccount
  signerMetadata: SignerMetadata | undefined
  hasUpdate?: boolean
  hasEdit?: boolean
  hasCopy?: boolean
  onUpdate?: (name: string) => void
  approved?: boolean
  ownerIsSelf?: boolean
}

interface SignerWrapperProps extends PropsWithChildren {
  hasCopy: boolean
  encodedSignerKey: string
}

const SignerWrapper: FC<SignerWrapperProps> = ({
  hasCopy,
  children,
  encodedSignerKey,
}) => {
  if (!hasCopy) {
    return children
  }
  return (
    <CopyTooltip copyValue={encodedSignerKey} prompt={encodedSignerKey}>
      {children}
    </CopyTooltip>
  )
}

export const MultisigOwner: FC<MultisigOwnerProps> = ({
  owner,
  account,
  signerMetadata,
  hasUpdate = false,
  hasEdit = false,
  hasCopy = false,
  onUpdate = noop,
  approved = false,
  ownerIsSelf = false,
}) => {
  const encodedSignerKey = useMemo(() => encodeBase58(owner), [owner])
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure()
  const {
    isOpen: isRemoveModalOpen,
    onOpen: onOpenRemoveModal,
    onClose: onCloseRemoveModal,
  } = useDisclosure()
  const navigate = useNavigate()

  const network = useCurrentNetwork()

  const onLedgerStart = useOnLedgerStart("multisig")

  const truncatedSignerKey =
    encodedSignerKey && formatTruncatedSignerKey(encodedSignerKey)

  const readOnly = !hasEdit && !hasUpdate

  const handleRemoveOwnerClick = () => {
    navigate(routes.multisigRemoveOwners(account?.id, encodedSignerKey))
  }

  const handleReplaceOwnerClick = () => {
    if (ownerIsSelf) {
      onLedgerStart("replace", network.id, encodedSignerKey)
    } else {
      navigate(routes.multisigReplaceOwner(account?.id, encodedSignerKey))
    }
  }

  return (
    <Flex
      borderRadius="lg"
      backgroundColor="neutrals.800"
      p={4}
      key={owner}
      my={2}
      alignItems="center"
    >
      {signerMetadata ? (
        <SignerWrapper hasCopy={hasCopy} encodedSignerKey={encodedSignerKey}>
          <Flex flexDirection="column">
            <H5 color="white">{signerMetadata.name}</H5>
            <P3 color="neutrals.300">{truncatedSignerKey}</P3>
          </Flex>
        </SignerWrapper>
      ) : (
        <SignerWrapper hasCopy={hasCopy} encodedSignerKey={encodedSignerKey}>
          <H5 color="white">{truncatedSignerKey}</H5>
        </SignerWrapper>
      )}
      {approved && (
        <Flex alignItems="center" marginLeft="auto">
          <CheckmarkSecondaryIcon color="primary.500" h={4} w={4} />
        </Flex>
      )}
      {!readOnly && (
        <Flex alignItems="center" gap={2} marginLeft="auto">
          {hasEdit && (
            <IconButton
              backgroundColor="neutrals.900"
              onClick={onOpenEditModal}
              aria-label="Edit owner name"
              icon={<EditPrimaryIcon />}
              h="auto"
              minH={0}
              minW={0}
              p={1.5}
              borderRadius="full"
            />
          )}
          {hasUpdate && (
            <Menu>
              <MenuButton
                data-testid={`edit-${encodedSignerKey}`}
                backgroundColor="neutrals.900"
                aria-label="Update owner"
                h="auto"
                minH={0}
                minW={0}
                p={1.5}
                borderRadius="full"
                _hover={{
                  backgroundColor: "neutrals.700",
                }}
                _focus={{
                  backgroundColor: "neutrals.700",
                }}
              >
                <SettingsSecondaryIcon w={4} h={4} />
              </MenuButton>
              <MenuList backgroundColor="neutrals.900">
                {!ownerIsSelf && (
                  <MenuItem
                    backgroundColor="neutrals.900"
                    onClick={onOpenRemoveModal}
                  >
                    Remove owner
                  </MenuItem>
                )}
                <MenuItem
                  backgroundColor="neutrals.900"
                  onClick={handleReplaceOwnerClick}
                >
                  {ownerIsSelf ? "Replace with Ledger" : "Replace owner"}
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      )}
      <MultisigOwnerNameModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onUpdate={onUpdate}
      />
      <MultisigRemoveOwnerModal
        isOpen={isRemoveModalOpen}
        onClose={onCloseRemoveModal}
        signerKey={encodedSignerKey}
        onRemove={() => handleRemoveOwnerClick()}
      />
    </Flex>
  )
}
