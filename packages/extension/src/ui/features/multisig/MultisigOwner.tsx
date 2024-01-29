import { CopyTooltip, H6, icons, P4 } from "@argent/ui"
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
import { FC, PropsWithChildren, useMemo } from "react"
import { Account } from "../accounts/Account"
import { noop } from "lodash-es"
import { encodeBase58, formatTruncatedSignerKey } from "@argent/shared"
import { SignerMetadata } from "../../../shared/multisig/types"
import { MultisigRemoveOwnerModal } from "./MultisigRemoveOwnerModal"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"

const { SettingsIcon, EditIcon, TickIcon } = icons

interface MultisigOwnerProps {
  owner: string
  account?: Account
  signerMetadata: SignerMetadata | undefined
  hasUpdate?: boolean
  hasEdit?: boolean
  hasCopy?: boolean
  onUpdate?: (name: string) => void
  approved?: boolean
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

  const truncatedSignerKey =
    encodedSignerKey && formatTruncatedSignerKey(encodedSignerKey)

  const readOnly = !hasEdit && !hasUpdate

  const handleRemoveOwnerClick = () => {
    navigate(routes.multisigRemoveOwners(account?.address, encodedSignerKey))
  }

  const handleReplaceOwnerClick = () => {
    navigate(routes.multisigReplaceOwner(account?.address, encodedSignerKey))
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
            <H6 color="white">{signerMetadata.name}</H6>
            <P4 color="neutrals.300">{truncatedSignerKey}</P4>
          </Flex>
        </SignerWrapper>
      ) : (
        <SignerWrapper hasCopy={hasCopy} encodedSignerKey={encodedSignerKey}>
          <H6 color="white">{truncatedSignerKey}</H6>
        </SignerWrapper>
      )}
      {approved && (
        <Flex alignItems="center" marginLeft="auto">
          <TickIcon color="primary.500" />
        </Flex>
      )}
      {!readOnly && (
        <Flex alignItems="center" gap={2} marginLeft="auto">
          {hasEdit && (
            <IconButton
              backgroundColor="neutrals.900"
              onClick={onOpenEditModal}
              aria-label="Edit owner name"
              icon={<EditIcon />}
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
                <SettingsIcon w={4} h={4} />
              </MenuButton>
              <MenuList backgroundColor="neutrals.900">
                <MenuItem
                  backgroundColor="neutrals.900"
                  onClick={onOpenRemoveModal}
                >
                  Remove owner
                </MenuItem>
                <MenuItem
                  backgroundColor="neutrals.900"
                  onClick={handleReplaceOwnerClick}
                >
                  Replace owner
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
