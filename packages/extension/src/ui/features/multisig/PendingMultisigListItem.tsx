import { ShowSecondaryIcon } from "@argent/x-ui/icons"
import { H5, P4 } from "@argent/x-ui"
import { Circle, Flex, Text, chakra } from "@chakra-ui/react"
import type { FC } from "react"

import type { CustomButtonCellProps } from "../../components/CustomButtonCell"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { encodeBase58, formatTruncatedSignerKey } from "@argent/x-shared"
import { AccountListItemLedgerBadge } from "../accounts/AccountListItemLedgerBadge"
import type { AccountId, AvatarMeta } from "../../../shared/wallet.model"
import { AccountAvatar } from "../accounts/AccountAvatar"

import { typographyStyles } from "@argent/x-ui/theme"

export interface PendingMultisigListItemProps extends CustomButtonCellProps {
  accountName: string
  publicKey: string
  networkId: string
  accountId: AccountId
  networkName?: string
  hidden?: boolean
  avatarOutlined?: boolean
  avatarMeta?: AvatarMeta
  isLedger?: boolean
}

export const NetworkStatusWrapper = chakra(Flex, {
  baseStyle: {
    alignItems: "center",
    justifyContent: "right",
    gap: 1,
    ml: 1,
    pointerEvents: "none",
    ...typographyStyles.L1Bold,
  },
})

export const PendingMultisigListItem: FC<PendingMultisigListItemProps> = ({
  accountName,
  publicKey,
  networkId,
  networkName,
  accountId,
  hidden,
  avatarOutlined,
  isLedger,
  avatarMeta,
  children,
  ...rest
}) => {
  const getAvatarBadge = () => {
    if (isLedger) {
      return <AccountListItemLedgerBadge />
    }
  }

  return (
    <CustomButtonCell {...rest}>
      <AccountAvatar
        size={12}
        outlined={avatarOutlined}
        accountId={accountId}
        accountType="multisig"
        accountName={accountName}
        avatarMeta={{ emoji: "⏳", ...avatarMeta }}
        emojiStyle={typographyStyles.H2}
        initialsStyle={typographyStyles.H4}
      >
        {getAvatarBadge()}
      </AccountAvatar>
      <Flex
        flex={1}
        overflow={"hidden"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Flex direction={"column"} overflow={"hidden"}>
          <Flex gap={1} alignItems={"center"}>
            <H5 overflow={"hidden"} textOverflow={"ellipsis"}>
              {accountName}
            </H5>
          </Flex>
          <Flex gap={2} color={"text-secondary"}>
            {hidden ? (
              <P4 w="full" sx={{ textWrap: "wrap" }}>
                {formatTruncatedSignerKey(encodeBase58(publicKey))}
              </P4>
            ) : (
              <>
                <P4 data-testid="signer-key" w="full" sx={{ textWrap: "wrap" }}>
                  {formatTruncatedSignerKey(encodeBase58(publicKey))}
                </P4>
                {networkName && <P4 noOfLines={1}>{networkName}</P4>}
              </>
            )}
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          {hidden && (
            <Circle size={10} bg={"neutrals.600"}>
              <Text fontSize={"2xl"}>
                <ShowSecondaryIcon />
              </Text>
            </Circle>
          )}
          {children}
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
