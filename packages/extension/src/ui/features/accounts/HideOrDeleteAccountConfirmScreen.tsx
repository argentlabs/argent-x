import { InfoCircleSecondaryIcon } from "@argent/x-ui/icons"
import { BarBackButton, H4, NavigationContainer, P2, P3 } from "@argent/x-ui"
import { Button, Center, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useMemo } from "react"

import { formatFullAddress } from "@argent/x-shared"
import { AccountAvatar } from "./AccountAvatar"
import { upperFirst } from "lodash-es"
import type {
  AvatarMeta,
  WalletAccountType,
} from "../../../shared/wallet.model"

import { typographyStyles } from "@argent/x-ui/theme"

export interface HideOrDeleteAccountConfirmScreenProps {
  accountId: string
  accountName: string
  accountAddress: string
  accountType: WalletAccountType
  avatarMeta?: AvatarMeta
  onSubmit: () => void
  onReject: () => void
  networkId: string
  mode: "hide" | "delete" | "remove"
}

export const HideOrDeleteAccountConfirmScreen: FC<
  HideOrDeleteAccountConfirmScreenProps
> = ({
  mode,
  accountId,
  accountName,
  accountAddress,
  accountType,
  onSubmit,
  onReject,
}) => {
  const subtext = useMemo(() => {
    if (mode === "hide") {
      return "You can unhide a hidden account from the preferences screen"
    }

    if (accountType === "imported") {
      return "You will need to import this account again"
    }

    return "You will not be able to recover this account in the future."
  }, [accountType, mode])

  return (
    <NavigationContainer
      title={upperFirst(mode) + " account"}
      leftButton={<BarBackButton onClick={onReject} />}
    >
      <Flex direction="column" align={"center"} px={4}>
        <P2 color="text-secondary" textAlign="center">
          You are about to {mode} the following account:
        </P2>
        <Center
          rounded={"lg"}
          bg={"surface-elevated"}
          p={8}
          flexDirection={"column"}
          textAlign={"center"}
          gap={4}
          my={4}
        >
          <AccountAvatar
            outlined={false}
            size={12}
            accountId={accountId}
            accountName={accountName}
            accountType={accountType}
            emojiStyle={typographyStyles.H2}
            initialsStyle={typographyStyles.H4}
          />

          <H4>{accountName}</H4>
          <P2 color="text-secondary">{formatFullAddress(accountAddress)}</P2>
        </Center>
        <Flex
          p={3}
          alignItems="center"
          bg="black"
          borderRadius={4}
          borderWidth={1}
          borderColor="text-secondary"
        >
          <InfoCircleSecondaryIcon color="text-secondary" w={4} h={4} mr={2} />
          <P3 color="text-secondary">{subtext}</P3>
        </Flex>
      </Flex>
      <Button
        onClick={onSubmit}
        colorScheme="primary"
        mt={4}
        position="absolute"
        bottom={6}
        mx={4}
        w="fill-available"
        data-testid="hide-or-delete-account-confirm-button"
      >
        {upperFirst(mode) + " account"}
      </Button>
    </NavigationContainer>
  )
}
