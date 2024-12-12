import { H5, icons, P3, typographyStyles } from "@argent/x-ui"
import { Circle, Flex, Text, chakra } from "@chakra-ui/react"
import type { FC } from "react"

import type { CustomButtonCellProps } from "../../components/CustomButtonCell"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { AccountAvatar } from "../accounts/AccountAvatar"
import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import { formatTruncatedAddress } from "@argent/x-shared"
import { AccountListItemLedgerBadge } from "../accounts/AccountListItemLedgerBadge"
import type { AccountId } from "../../../shared/wallet.model"

const { ShowSecondaryIcon } = icons

export interface PendingMultisigListItemProps extends CustomButtonCellProps {
  accountName: string
  publicKey: string
  networkId: string
  accountId: AccountId
  networkName?: string
  hidden?: boolean
  avatarOutlined?: boolean
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
        outlined={avatarOutlined}
        src={getNetworkAccountImageUrl({
          accountName,
          accountId,
          backgroundColor: hidden ? "#333332" : undefined,
        })}
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
          <Flex gap={2} color={"neutrals.300"}>
            {hidden ? (
              <P3 fontWeight={"semibold"}>
                {formatTruncatedAddress(publicKey)}
              </P3>
            ) : (
              <>
                <P3 fontWeight={"semibold"}>Awaiting owner to finish setup</P3>
                {networkName && <P3 noOfLines={1}>{networkName}</P3>}
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
