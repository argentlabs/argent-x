import { Button, CellStack, icons } from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { FC } from "react"
import { Link, To } from "react-router-dom"

import { ShieldHeader } from "./ui/ShieldHeader"
import { ChangeGuardian } from "./usePendingChangingGuardian"

const { ArgentShieldIcon, ArgentShieldDeactivateIcon, TickIcon } = icons

export interface ShieldBaseFinishScreenProps {
  accountName?: string
  pendingChangeGuardian?: ChangeGuardian
  guardian?: string
  returnRoute: To
}

export const ShieldBaseFinishScreen: FC<ShieldBaseFinishScreenProps> = ({
  accountName,
  pendingChangeGuardian,
  guardian,
  returnRoute,
}) => {
  let icon
  if (pendingChangeGuardian) {
    icon = ChangeGuardian.ADDING ? ArgentShieldIcon : ArgentShieldDeactivateIcon
  } else {
    icon = guardian ? TickIcon : ArgentShieldDeactivateIcon
  }

  const variant = pendingChangeGuardian
    ? "default"
    : guardian
    ? "success"
    : "removed"

  const title = pendingChangeGuardian
    ? `${
        pendingChangeGuardian === ChangeGuardian.ADDING ? "Adding" : "Removing"
      } Argent Shield…`
    : `Argent Shield ${guardian ? "added" : "removed"}`

  const subtitle = pendingChangeGuardian ? (
    pendingChangeGuardian === ChangeGuardian.ADDING ? (
      <>
        Argent Shield is being added to {accountName}. A{" "}
        <ArgentShieldIcon
          display={"inline"}
          position={"relative"}
          top={"0.125em"}
        />{" "}
        icon will appear next to your account name once it’s added
      </>
    ) : (
      <>
        Argent Shield is being removed from {accountName}. This can take a few
        minutes
      </>
    )
  ) : guardian ? (
    `${accountName} is now protected by Argent Shield two-factor authentication`
  ) : (
    `${accountName} is not protected by Argent Shield two-factor authentication`
  )

  const isLoading = Boolean(pendingChangeGuardian)

  return (
    <CellStack flex={1}>
      <Center flex={1}>
        <ShieldHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          isLoading={isLoading}
          variant={variant}
          size={"lg"}
        />
      </Center>
      <Button as={Link} to={returnRoute} colorScheme={"primary"}>
        {isLoading ? "Dismiss" : "Done"}
      </Button>
    </CellStack>
  )
}
