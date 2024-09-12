import {
  BarBackButton,
  H5,
  NavigationContainer,
  P3,
  P4,
  iconsDeprecated,
} from "@argent/x-ui"
import { Button, Center, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { HideOrDeleteAccountConfirmScreenProps } from "./hideOrDeleteAccountConfirmScreen.model"
import { formatFullAddress, getNetworkAccountImageUrl } from "@argent/x-shared"
import { AccountAvatar } from "./AccountAvatar"

const { InfoIcon } = iconsDeprecated

export const HideOrDeleteAccountConfirmScreen: FC<
  HideOrDeleteAccountConfirmScreenProps
> = ({ mode, accountName, accountAddress, onSubmit, onReject, networkId }) => {
  return (
    <NavigationContainer
      title="Hide account"
      leftButton={<BarBackButton onClick={onReject} />}
    >
      <Flex direction="column" align={"center"} px={4}>
        <P3 color="text-secondary" textAlign="center">
          {mode === "hide"
            ? "You are about to hide the following account:"
            : "You are about to delete the following account:"}
        </P3>
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
            src={getNetworkAccountImageUrl({
              accountName,
              accountAddress,
              networkId,
            })}
          />

          <H5>{accountName}</H5>
          <P3 color="text-secondary">{formatFullAddress(accountAddress)}</P3>
        </Center>
        <Flex
          p={3}
          alignItems="center"
          bg="black"
          borderRadius={4}
          borderWidth={1}
          borderColor="text-secondary"
        >
          <InfoIcon color="text-secondary" w={4} h={4} mr={2} />
          <P4 color="text-secondary">
            {mode === "hide"
              ? "You can unhide a hidden account from the preferences screen"
              : "You will not be able to recover this account in the future."}
          </P4>
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
        {mode === "hide" ? "Hide account" : "Delete account"}
      </Button>
    </NavigationContainer>
  )
}
