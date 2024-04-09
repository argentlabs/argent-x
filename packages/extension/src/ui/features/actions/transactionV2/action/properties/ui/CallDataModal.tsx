import { ModalDialogData } from "@argent/x-ui"
import { Button, Flex, Text } from "@chakra-ui/react"

export function CallDataModal({
  calldata,
  isOpen,
  onClose,
  onOpen,
  label,
  title,
  alignRight = true,
}: {
  calldata: string
  label: string
  title: string
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  alignRight?: boolean
}) {
  return (
    <Flex gap="1" alignItems={"center"} ml={alignRight ? "auto" : undefined}>
      <ModalDialogData
        title={title}
        data={calldata}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Button
        size={"sm"}
        colorScheme={"transparent"}
        mx={"auto"}
        onClick={onOpen}
        color="neutrals.400"
        loadingText={"Fetching tokens"}
      >
        {label}
      </Button>
    </Flex>
  )
}
