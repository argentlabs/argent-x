import type { TextProps } from "@chakra-ui/react"
import { Circle, Flex, type SquareProps, Text } from "@chakra-ui/react"
import { type FC } from "react"
import type {
  AvatarMeta,
  WalletAccountType,
} from "../../../shared/wallet.model"
import { getInitials } from "@argent/x-shared"
import { getRandomAccountIdentifier } from "../../../shared/utils/accountIdentifier"
import { getAccountLabelVersion } from "../../../shared/accountNameGenerator/utils"
import { getAccountMeta } from "../../../shared/accountNameGenerator"

interface AccountAvatarWrapperProps
  extends Omit<SquareProps, "content" | "size"> {
  content: React.ReactNode
  outlined?: boolean
  size?: string | number
}

const AccountAvatarWrapper: FC<AccountAvatarWrapperProps> = ({
  content,
  children,
  size = 12,
  outlined,
  ...rest
}) => {
  return (
    <Flex position={"relative"} flexShrink={0}>
      <Circle size={size} textAlign="center" {...rest}>
        {content}
      </Circle>

      {outlined && (
        <>
          <Circle
            position={"absolute"}
            top={0}
            size={size}
            borderWidth={"0.25rem"}
            borderColor={"surface-default"}
          />
          <Circle
            position={"absolute"}
            top={0}
            size={size}
            borderWidth={"0.125rem"}
            borderColor={"text-primary"}
          />
        </>
      )}
      {children}
    </Flex>
  )
}

export interface AccountEmojiAvatarProps
  extends Omit<AccountAvatarWrapperProps, "content"> {
  accountId: string
  accountType?: WalletAccountType
  avatarMeta?: AvatarMeta
  emojiStyle?: TextProps
}

export const AccountEmojiAvatar: FC<AccountEmojiAvatarProps> = ({
  accountId,
  accountType = "standard",
  avatarMeta,
  emojiStyle,
  ...rest
}) => {
  const { emoji, color } = getAccountMeta(accountId, accountType)

  const bgColor = avatarMeta?.bgColor || color.token
  const content = avatarMeta?.emoji || emoji

  return (
    <AccountAvatarWrapper
      bgColor={bgColor}
      content={<Text {...emojiStyle}>{content}</Text>}
      {...rest}
    />
  )
}

interface AccountInitialsAvatarProps
  extends Omit<AccountAvatarWrapperProps, "content"> {
  accountId: string
  accountName: string
  accountType?: WalletAccountType
  avatarMeta?: AvatarMeta
  initialsStyle?: TextProps
}

export const AccountInitialsAvatar: FC<AccountInitialsAvatarProps> = ({
  accountName,
  accountId,
  accountType = "standard",
  avatarMeta,
  size = 12,
  initialsStyle,
  ...rest
}) => {
  const initials = getInitials(accountName, true)
  const bgColor =
    avatarMeta?.bgColor ??
    getAccountMeta(accountId ?? getRandomAccountIdentifier(), accountType).color
      .token

  return (
    <AccountAvatarWrapper
      bgColor={bgColor}
      content={<Text {...initialsStyle}>{initials}</Text>}
      size={size}
      {...rest}
    />
  )
}

type AccountAvatarProps = AccountEmojiAvatarProps & AccountInitialsAvatarProps

export const AccountAvatar: FC<AccountAvatarProps> = ({
  emojiStyle,
  initialsStyle,
  ...props
}) => {
  const { avatarMeta, accountName } = props
  return getAccountLabelVersion(accountName, avatarMeta) === "v1" ? (
    <AccountInitialsAvatar initialsStyle={initialsStyle} {...props} />
  ) : (
    <AccountEmojiAvatar emojiStyle={emojiStyle} {...props} />
  )
}
