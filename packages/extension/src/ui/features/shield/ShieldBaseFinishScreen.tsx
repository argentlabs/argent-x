import { Button, CellStack, P3, P4, icons } from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { FC } from "react"
import { Link, To } from "react-router-dom"

import { ShieldHeader } from "./ui/ShieldHeader"
import { ChangeGuardian } from "./usePendingChangingGuardian"

const {
  ArgentShieldIcon,
  ArgentShieldDeactivateIcon,
  TickIcon,
  AnnouncementIcon,
} = icons

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
      <Center flex={1} flexDirection={"column"}>
        <ShieldHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          isLoading={isLoading}
          variant={variant}
          size={"lg"}
        />
        <Center
          bg={"accent.800"}
          rounded={"xl"}
          flexDirection={"column"}
          px={3}
          py={4}
          textAlign={"center"}
        >
          <P3 mb={2} fontWeight={"semibold"}>
            <AnnouncementIcon
              display={"inline-block"}
              fontSize={"xl"}
              verticalAlign={"bottom"}
              transform={"scaleX(-1)"}
              mr={1}
            />{" "}
            We want to hear your feedback
          </P3>
          <P4 mb={4}>
            Thanks for being an early tester of Argent Shield. Let us know your
            thoughts on Discord
          </P4>
          <Button
            as={"a"}
            href="https://discord.gg/T4PDFHxm6T"
            target="_blank"
            colorScheme={"accent"}
            size={"xs"}
            w={"100%"}
          >
            Share feedback
          </Button>
        </Center>
      </Center>
      <Button as={Link} to={returnRoute} colorScheme={"primary"}>
        {isLoading ? "Dismiss" : "Done"}
      </Button>
    </CellStack>
  )
}
