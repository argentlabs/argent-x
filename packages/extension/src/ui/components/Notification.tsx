import { FC } from "react"
import { UIShowNotificationPayload } from "../../shared/ui/UIMessage"
import { Flex, FlexProps, Image, IconButton } from "@chakra-ui/react"
import { P4 } from "@argent/x-ui"
import { CloseIcon } from "@chakra-ui/icons"

export interface NotificationProps
  extends FlexProps,
    Omit<UIShowNotificationPayload, "notificationId"> {}

export const Notification: FC<NotificationProps> = ({
  iconUrl,
  title,
  onClose,
  ...rest
}) => {
  if ((window as any).PLAYWRIGHT) {
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
        {title && <P4 fontWeight="bold">{title}</P4>}
      </Flex>
      <P4 color="text-secondary">View</P4>
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
