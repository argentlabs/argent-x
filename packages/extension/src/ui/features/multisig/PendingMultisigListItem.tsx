import { H6, P4, iconsDeprecated, typographyStyles } from "@argent/x-ui"
import { Circle, Flex, Text, chakra } from "@chakra-ui/react"
import { FC } from "react"

import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import { AccountAvatar } from "../accounts/AccountAvatar"
import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import { formatTruncatedAddress } from "@argent/x-shared"
import { AccountListItemLedgerBadge } from "../accounts/AccountListItemLedgerBadge"

const { ViewIcon } = iconsDeprecated

export interface PendingMultisigListItemProps extends CustomButtonCellProps {
  accountName: string
  publicKey: string
  networkId: string
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
    ...typographyStyles.L1,
  },
})

export const PendingMultisigListItem: FC<PendingMultisigListItemProps> = ({
  accountName,
  publicKey,
  networkId,
  networkName,
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
          accountAddress: publicKey, // Use publicKey instead of accountAddress
          networkId,
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
            <H6 overflow={"hidden"} textOverflow={"ellipsis"}>
              {accountName}
            </H6>
          </Flex>
          <Flex gap={2} color={"neutrals.300"}>
            {hidden ? (
              <P4 fontWeight={"semibold"}>
                {formatTruncatedAddress(publicKey)}
              </P4>
            ) : (
              <>
                <P4 fontWeight={"semibold"}>Awaiting owner to finish setup</P4>
                {networkName && <P4 noOfLines={1}>{networkName}</P4>}
              </>
            )}
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          {hidden && (
            <Circle size={10} bg={"neutrals.600"}>
              <Text fontSize={"2xl"}>
                <ViewIcon />
              </Text>
            </Circle>
          )}
          {children}
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
