import { type FC } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { Center, Circle } from "@chakra-ui/react"
import type { Transition } from "framer-motion"
import { motion } from "framer-motion"
import type { LabelVersion } from "./types"
import {
  AccountEmojiAvatar,
  AccountInitialsAvatar,
} from "../accounts/AccountAvatar"
import { typographyStyles } from "@argent/x-ui/theme"

export interface AccountAvatarSelectorProps {
  labelVersion: LabelVersion
  onLabelVersionChange: (labelVersion: LabelVersion) => void
  account: WalletAccount
  accountName: string
  bgColor?: string
  emoji?: string | null
}

export const AccountAvatarSelector: FC<AccountAvatarSelectorProps> = ({
  labelVersion = "v2",
  onLabelVersionChange,
  account,
  accountName,
  bgColor,
  emoji,
}) => {
  const transition: Transition = {
    type: "tween",
    duration: 0.5,
    opacity: { duration: 0.3 },
  }

  return (
    <Center gap={1} pb={4} w="100%" position="relative">
      {labelVersion === "v1" && <Circle size={16} opacity={0} />}
      <motion.div
        initial={false}
        animate={{
          x: labelVersion === "v1" ? 0 : -8,
          opacity: labelVersion === "v1" ? 1 : 0.5,
        }}
        transition={transition}
      >
        <AccountInitialsAvatar
          size={16}
          accountId={account.id}
          accountName={accountName}
          opacity={labelVersion === "v1" ? 1 : 0.5}
          onClick={() => onLabelVersionChange("v1")}
          cursor={"pointer"}
          avatarMeta={{ bgColor, emoji }}
          initialsStyle={{ ...typographyStyles.H3, fontWeight: "500" }}
        />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          x: labelVersion === "v2" ? 0 : 8,
          opacity: labelVersion === "v2" ? 1 : 0.5,
        }}
        transition={transition}
      >
        <AccountEmojiAvatar
          size={16}
          accountId={account.id}
          accountType={account.type}
          opacity={labelVersion === "v2" ? 1 : 0.5}
          onClick={() => onLabelVersionChange("v2")}
          cursor={"pointer"}
          avatarMeta={{ bgColor, emoji }}
          emojiStyle={typographyStyles.H1}
        />
      </motion.div>
      {labelVersion === "v2" && <Circle size={16} opacity={0} />}
    </Center>
  )
}
