import type { FC } from "react"
import type { UIShowNotificationPayload } from "../../shared/ui/UIMessage"
import type { FlexProps } from "@chakra-ui/react"
import { Flex, Image, IconButton } from "@chakra-ui/react"
import { P3 } from "@argent/x-ui"
import { CloseIcon } from "@chakra-ui/icons"
import { isPlaywright } from "../../shared/api/constants"

export interface NotificationProps
  extends FlexProps,
    Omit<UIShowNotificationPayload, "notificationId"> {}

export const Notification: FC<NotificationProps> = ({
  iconUrl,
  title,
  onClose,
  ...rest
}) => {
  if (isPlaywright) {
    return null
  }
  return (
    <Flex
      boxShadow="menu"
      bg="surface-elevated"
      rounded="xl"
      p={3}
      alignItems="center"
      gap={3}
      cursor="pointer"
      w={"full"}
      role="group"
      border="1px solid"
      borderColor="white.12"
      position="relative"
      {...rest}
    >
      {iconUrl && <Image src={iconUrl} w={8} h={8} />}
      <Flex direction="column" flex={1}>
        {title && <P3 fontWeight="bold">{title}</P3>}
      </Flex>
      <P3 color="text-secondary">View</P3>
      <IconButton
        position="absolute"
        bg="surface-elevated"
        border="1px solid"
        borderColor="white.12"
        top={-2}
        right={-2}
        borderRadius="full"
        padding="5px"
        icon={<CloseIcon height={2} width={2} />}
        aria-label="Close notification"
        size={"auto"}
        visibility="hidden"
        _groupHover={{ visibility: "visible" }}
        onClick={onClose}
      />
    </Flex>
  )
}
